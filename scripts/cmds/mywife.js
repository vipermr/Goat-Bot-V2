const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "mywife",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Get your wife (mywife)" },
    longDescription: { en: "Shows you with your chosen or random wife" },
    category: "love",
    guide: { en: "{pn} (or reply/tag a person as your wife)" }
  },

  onStart: async function ({ api, event, usersData }) {
    const backgroundUrl = "https://raw.githubusercontent.com/alkama844/res/main/image/pair.jpg";

    const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

    const getAvatarUrl = (id) => 
      `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=${token}`;

    try {
      const husbandID = event.senderID;
      const husbandName = await usersData.getName(husbandID);

      let wifeID, wifeName;

      if (event.type === "message_reply") {
        wifeID = event.messageReply.senderID;
        wifeName = await usersData.getName(wifeID);
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        wifeID = Object.keys(event.mentions)[0];
        wifeName = await usersData.getName(wifeID);
      } else {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const allUsers = threadInfo.userInfo;
        const botID = api.getCurrentUserID();

        const candidates = allUsers.filter(u =>
          u.id !== husbandID && u.id !== botID
        );

        if (candidates.length === 0) {
          return api.sendMessage("No suitable wife found in this group.", event.threadID);
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        wifeID = chosen.id;
        wifeName = await usersData.getName(wifeID);
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

      // Left box: wife | Right box: husband
      ctx.drawImage(wifeAvt, 150, 170, 280, 280);
      ctx.drawImage(husbandAvt, 1010, 170, 280, 280);

      const outPath = __dirname + "/assets/mywife_result.png";
      const buffer = canvas.toBuffer("image/png");
      await fs.outputFile(outPath, buffer);

      const specialRates = ["0.01", "∞", "100", "99.99", "❤"];
      const rate = Math.random() < 0.85
        ? `${Math.floor(Math.random() * 100)}%`
        : specialRates[Math.floor(Math.random() * specialRates.length)];

      const message = `💍 Marriage Certificate 💍\n\n` +
        `👰 Wife: ${wifeName}\n` +
        `🤵 Husband: ${husbandName}\n\n` +
        `❤ Compatibility Score: ${rate}\n` +
        `✨ Wishing you a love story that never ends.\n` +
        `#MyWife - She's yours now!`;

      return api.sendMessage({
        body: message,
        mentions: [
          { tag: wifeName, id: wifeID },
          { tag: husbandName, id: husbandID }
        ],
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath), event.messageID);

    } catch (error) {
      console.error("Error in mywife command:", error);
      return api.sendMessage("An error occurred while creating your marriage image.", event.threadID);
    }
  }
};