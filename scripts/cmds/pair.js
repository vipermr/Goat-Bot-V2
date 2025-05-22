const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

let lastUsedTime = 0;
const globalCooldown = 10 * 1000; // 10 seconds

module.exports = {
  config: {
    name: "pair",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Pair you with a match" },
    longDescription: { en: "Pair a user with an opposite-gender user in the group or directly with someone via tag/reply" },
    category: "love",
    guide: { en: "{pn} (or reply/tag someone to match with them)" }
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

      let user1ID = senderID;
      let user2ID = null;

      if (event.type === "message_reply") {
        user2ID = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        user2ID = Object.keys(event.mentions)[0];
      }

      if (user2ID) {
        // Directly pair sender with target (no gender checks)
        const user1Name = await usersData.getName(user1ID);
        const user2Name = await usersData.getName(user2ID);

        const [bgRes, avt1Res, avt2Res] = await Promise.all([
          axios.get(backgroundUrl, { responseType: "arraybuffer" }),
          axios.get(getAvatarUrl(user1ID), { responseType: "arraybuffer" }),
          axios.get(getAvatarUrl(user2ID), { responseType: "arraybuffer" }),
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
          `👤 ${user1Name}\n` +
          `💞 Paired with: ${user2Name}\n\n` +
          `❤ Compatibility: ${score}\n` +
          `#Pair - True love never fails.`;

        return api.sendMessage({
          body: message,
          mentions: [
            { tag: user1Name, id: user1ID },
            { tag: user2Name, id: user2ID }
          ],
          attachment: fs.createReadStream(pathOut)
        }, event.threadID, () => fs.unlinkSync(pathOut), event.messageID);
      }

      // If no tag or reply, pair with opposite-gender
      const requesterInfo = allUsers.find(u => u.id === user1ID);
      const requesterGender = requesterInfo?.gender?.toUpperCase() || "UNKNOWN";
      const requesterName = await usersData.getName(user1ID);

      const matchGender = requesterGender === "MALE" ? "FEMALE" :
                          requesterGender === "FEMALE" ? "MALE" : "UNKNOWN";

      if (matchGender === "UNKNOWN") {
        return api.sendMessage("❗ Unable to determine your gender. Please update your Facebook gender.", event.threadID);
      }

      const candidates = allUsers.filter(u =>
        u.id !== user1ID &&
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
        axios.get(getAvatarUrl(user1ID), { responseType: "arraybuffer" }),
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
        `👤 ${requesterName}\n` +
        `💞 Paired with: ${matchName}\n\n` +
        `❤ Compatibility: ${score}\n` +
        `#Pair - True love never fails.`;

      return api.sendMessage({
        body: message,
        mentions: [
          { tag: requesterName, id: user1ID },
          { tag: matchName, id: matchUser.id }
        ],
        attachment: fs.createReadStream(pathOut)
      }, event.threadID, () => fs.unlinkSync(pathOut), event.messageID);

    } catch (err) {
      console.error("Error in pair command:", err);
      return api.sendMessage("Something went wrong while finding a match.", event.threadID);
    }
  }
};