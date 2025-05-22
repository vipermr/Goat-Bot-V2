const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "myhusband",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Get your husband (myhusband)" },
    longDescription: { en: "Shows you with your chosen or random husband" },
    category: "love",
    guide: { en: "{pn} (or reply/tag a person as your husband)" }
  },

  onStart: async function ({ api, event, usersData }) {
    const backgroundUrl = "https://raw.githubusercontent.com/alkama844/res/main/image/pair.jpg";

    const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

    const getAvatarUrl = (id) => 
      `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=${token}`;

    try {
      const wifeID = event.senderID;
      const wifeName = await usersData.getName(wifeID);

      let husbandID, husbandName;

      if (event.type === "message_reply") {
        husbandID = event.messageReply.senderID;
        husbandName = await usersData.getName(husbandID);
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        husbandID = Object.keys(event.mentions)[0];
        husbandName = await usersData.getName(husbandID);
      } else {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const allUsers = threadInfo.userInfo;
        const botID = api.getCurrentUserID();

        const candidates = allUsers.filter(u =>
          u.id !== wifeID && u.id !== botID
        );

        if (candidates.length === 0) {
          return api.sendMessage("No suitable husband found in this group.", event.threadID);
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        husbandID = chosen.id;
        husbandName = await usersData.getName(husbandID);
      }

      const [bgRes, husbandAvtRes, wifeAvtRes] = await Promise.all([
        axios.get(backgroundUrl, { responseType: "arraybuffer" }),
        axios.get(getAvatarUrl(husbandID), { responseType: "arraybuffer" }),
        axios.get(getAvatarUrl(wifeID), { responseType: "arraybuffer" })
      ]);

      const bg = await loadImage(Buffer.from(bgRes.data));
      const husbandAvt = await loadImage(Buffer.from(husbandAvtRes.data));
      const wifeAvt = await loadImage(Buffer.from(wifeAvtRes.data));

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Left box: husband | Right box: wife
      ctx.drawImage(husbandAvt, 150, 170, 280, 280);
      ctx.drawImage(wifeAvt, 1010, 170, 280, 280);

      const outPath = __dirname + "/assets/myhusband_result.png";
      const buffer = canvas.toBuffer("image/png");
      await fs.outputFile(outPath, buffer);

      const specialRates = ["0.01", "∞", "100", "99.99", "❤"];
      const rate = Math.random() < 0.85
        ? `${Math.floor(Math.random() * 100)}%`
        : specialRates[Math.floor(Math.random() * specialRates.length)];

      const message = `💍 Marriage Certificate 💍\n\n` +
        `🤵 Husband: ${husbandName}\n` +
        `👰 Wife: ${wifeName}\n\n` +
        `❤ Compatibility Score: ${rate}\n` +
        `✨ May your love be eternal and joyful.\n` +
        `#MyHusband - He's yours now!`;

      return api.sendMessage({
        body: message,
        mentions: [
          { tag: husbandName, id: husbandID },
          { tag: wifeName, id: wifeID }
        ],
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath), event.messageID);

    } catch (error) {
      console.error("Error in myhusband command:", error);
      return api.sendMessage("An error occurred while creating your marriage image.", event.threadID);
    }
  }
};