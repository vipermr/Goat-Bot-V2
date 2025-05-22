const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

let lastUsedTime = 0;
const globalCooldown = 10 * 1000; // 10 seconds

module.exports = {
  config: {
    name: "pair2",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Pair with a random match of opposite gender" },
    longDescription: { en: "Pairs the sender with a random opposite-gender user in the group" },
    category: "love",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, usersData }) {
    const now = Date.now();
    if (now - lastUsedTime < globalCooldown) {
      const remaining = Math.ceil((globalCooldown - (now - lastUsedTime)) / 1000);
      return api.sendMessage(`⏳ Please wait ${remaining} seconds before using this command again.`, event.threadID);
    }
    lastUsedTime = now;

    const backgroundUrl = "https://raw.githubusercontent.com/alkama844/res/main/image/pair.jpg";
    const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
    const pathOut = __dirname + "/assets/pair_result.png";

    const getAvatarUrl = (id) =>
      `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=${token}`;

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const allUsers = threadInfo.userInfo;
      const botID = api.getCurrentUserID();

      const senderID = event.senderID;
      const senderInfo = allUsers.find(u => u.id === senderID);
      const senderGender = senderInfo?.gender?.toUpperCase() || "UNKNOWN";
      const senderName = await usersData.getName(senderID);

      const matchGender = senderGender === "MALE" ? "FEMALE"
                        : senderGender === "FEMALE" ? "MALE"
                        : "UNKNOWN";

      if (matchGender === "UNKNOWN") {
        return api.sendMessage("❗ Can't detect your gender. Please update your Facebook gender settings.", event.threadID);
      }

      const candidates = allUsers.filter(u =>
        u.id !== senderID &&
        u.id !== botID &&
        u.gender?.toUpperCase() === matchGender
      );

      if (candidates.length === 0) {
        return api.sendMessage(
          matchGender === "FEMALE" ? "❌ No girl found." : "❌ No boy found.",
          event.threadID
        );
      }

      const matchUser = candidates[Math.floor(Math.random() * candidates.length)];
      const matchName = await usersData.getName(matchUser.id);

      const [bgRes, avt1Res, avt2Res] = await Promise.all([
        axios.get(backgroundUrl, { responseType: "arraybuffer" }),
        axios.get(getAvatarUrl(senderID), { responseType: "arraybuffer" }),
        axios.get(getAvatarUrl(matchUser.id), { responseType: "arraybuffer" }),
      ]);

      const [bg, avt1, avt2] = await Promise.all([
        loadImage(Buffer.from(bgRes.data)),
        loadImage(Buffer.from(avt1Res.data)),
        loadImage(Buffer.from(avt2Res.data))
      ]);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(avt1, 150, 170, 280, 280);
      ctx.drawImage(avt2, 1010, 170, 280, 280);

      await fs.outputFile(pathOut, canvas.toBuffer("image/png"));

      const scores = ["100%", "∞", "99.9%", "❤", "88%", "75%", "93%"];
      const score = scores[Math.floor(Math.random() * scores.length)];

      const message = `💖 Destiny Match 💖\n\n` +
        `👤 ${senderName}\n` +
        `💞 Paired with: ${matchName}\n\n` +
        `❤ Compatibility: ${score}\n` +
        `#Pair - True love never fails.`;

      return api.sendMessage({
        body: message,
        mentions: [
          { tag: senderName, id: senderID },
          { tag: matchName, id: matchUser.id }
        ],
        attachment: fs.createReadStream(pathOut)
      }, event.threadID, () => fs.unlinkSync(pathOut), event.messageID);

    } catch (err) {
      console.error("Error in pair2 command:", err);
      return api.sendMessage("❌ Something went wrong while pairing.", event.threadID);
    }
  }
};