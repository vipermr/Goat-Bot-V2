const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair4",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Reveal your destined partner"
    },
    longDescription: {
      en: "A beautifully crafted fate-match experience for lovers"
    },
    category: "love",
    guide: {
      en: "{pn} (or reply to someone)"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const pathImg = __dirname + "/assets/pair4_bg.png";
    const pathAvt1 = __dirname + "/assets/pair4_avt1.png";
    const pathAvt2 = __dirname + "/assets/pair4_avt2.png";
    const backgroundUrl = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/pair4.jpg";

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
        return api.sendMessage("No perfect match found right now. Try again later!", event.threadID);
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

    // Canvas drawing
    const baseImage = await loadImage(pathImg);
    const avatar1 = await loadImage(pathAvt1);
    const avatar2 = await loadImage(pathAvt2);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(avatar1, 110, 190, 330, 330);
    ctx.drawImage(avatar2, 1020, 190, 330, 330);

    const finalImage = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalImage);

    // Cleanup
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    const loveRates = ["98.9%", "101%", "fated", "∞", "0.01%", "99.99%", "destined"];
    const chance = Math.random() < 0.8;
    const loveScore = chance ? `${Math.floor(Math.random() * 100)}%` : loveRates[Math.floor(Math.random() * loveRates.length)];

    const message = `💫 𝑻𝒉𝒆 𝑺𝒕𝒂𝒓𝒔 𝑯𝒂𝒗𝒆 𝑨𝒍𝒊𝒈𝒏𝒆𝒅 💫\n\n` +
      `🌹 𝑷𝒓𝒆𝒔𝒆𝒏𝒕𝒊𝒏𝒈 a divine bond sealed by destiny:\n` +
      `👸 Partner One: ${name1}\n` +
      `🤴 Partner Two: ${name2}\n\n` +
      `🔗 𝑪𝒐𝒎𝒑𝒂𝒕𝒊𝒃𝒊𝒍𝒊𝒕𝒚 𝑺𝒄𝒐𝒓𝒆: ${loveScore}\n\n` +
      `✨ May your journey be filled with laughter, dreams, and eternal trust.\n` +
      `💍 Wishing you both a future of moonlit dances, soft whispers, and an everlasting love that grows brighter each day.\n\n` +
      `— 𝒑𝒂𝒊𝒓4: 𝒀𝒐𝒖 𝒂𝒓𝒆 𝒎𝒆𝒂𝒏𝒕 𝒕𝒐 𝒃𝒆.`

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