const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair3",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Find your life partner (ver 3)"
    },
    longDescription: {
      en: "Matches you with a husband or wife for a long and happy life"
    },
    category: "love",
    guide: {
      en: "{pn} (or reply to someone's message)"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const pathImg = __dirname + "/assets/pair3_bg.png";
    const pathAvt1 = __dirname + "/assets/pair3_avt1.png";
    const pathAvt2 = __dirname + "/assets/pair3_avt2.png";
    const backgroundUrl = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/pair3.jpg";

    const senderID = event.senderID;
    const name1 = await usersData.getName(senderID);
    let id2, name2;

    if (event.type === "message_reply") {
      id2 = event.messageReply.senderID;
      name2 = await usersData.getName(id2);
    } else {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const allUsers = threadInfo.userInfo;
      const botID = api.getCurrentUserID();
      const senderGender = allUsers.find(u => u.id === senderID)?.gender || "UNKNOWN";

      const candidates = allUsers.filter(u =>
        u.id !== senderID &&
        u.id !== botID &&
        (
          (senderGender === "MALE" && u.gender === "FEMALE") ||
          (senderGender === "FEMALE" && u.gender === "MALE") ||
          (senderGender === "UNKNOWN")
        )
      );

      if (candidates.length === 0) {
        return api.sendMessage("No suitable partner found in this group.", event.threadID);
      }

      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      id2 = chosen.id;
      name2 = await usersData.getName(id2);
    }

    // Download avatars and background
    const [avt1Data, avt2Data, bgData] = await Promise.all([
      axios.get(`https://graph.facebook.com/${senderID}/picture?width=720&height=720`, { responseType: "arraybuffer" }),
      axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720`, { responseType: "arraybuffer" }),
      axios.get(backgroundUrl, { responseType: "arraybuffer" })
    ]);

    fs.writeFileSync(pathAvt1, Buffer.from(avt1Data.data, "utf-8"));
    fs.writeFileSync(pathAvt2, Buffer.from(avt2Data.data, "utf-8"));
    fs.writeFileSync(pathImg, Buffer.from(bgData.data, "utf-8"));

    // Draw image
    const baseImage = await loadImage(pathImg);
    const avatar1 = await loadImage(pathAvt1);
    const avatar2 = await loadImage(pathAvt2);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(avatar1, 110, 180, 330, 330);
    ctx.drawImage(avatar2, 1020, 180, 330, 330);

    const finalImage = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalImage);

    // Clean up
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    const specialRates = ["0.01", "∞", "100", "99.99", "❤️"];
    const rate = Math.random() < 0.85
      ? `${Math.floor(Math.random() * 100)}%`
      : specialRates[Math.floor(Math.random() * specialRates.length)];

    const message = `💍 Official Marriage Certificate 💍\n\n` +
      `👰 Wife: ${name1}\n` +
      `🤵 Husband: ${name2}\n\n` +
      `❤️ Compatibility Score: ${rate}\n` +
      `✨ May your marriage be full of joy, respect, and everlasting love.\n` +
      `🕊️ Wishing you a long life and countless happy days together.\n\n` +
      `#Pair3 - Soulbound by destiny.`

    return api.sendMessage({
      body: message,
      mentions: [
        { tag: name1, id: senderID },
        { tag: name2, id: id2 }
      ],
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
  }
};