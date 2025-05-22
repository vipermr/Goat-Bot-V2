const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "trash",
    version: "1.1",
    author: "NAFIJ",
    countDown: 5,
    role: 0,
    shortDescription: "Put someone in the trash",
    longDescription: "Put someone in the trash can (tag or reply).",
    category: "pro",
    guide: {
      en: "{pn} @tag or reply"
    }
  },

  onStart: async function ({ event, message }) {
    const senderID = event.senderID;
    let targetID = Object.keys(event.mentions)[0];

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) return message.reply("❌ | Please tag or reply to someone.");

    const avatarURL = id =>
      `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const folderPath = __dirname;
    const bgPath = path.join(folderPath, "toilet1.png");
    const avatar1Path = path.join(folderPath, `avt1_${senderID}.png`);
    const avatar2Path = path.join(folderPath, `avt2_${targetID}.png`);
    const outPath = path.join(folderPath, `trash_${senderID}_${targetID}.png`);

    try {
      // Download toilet1.png if not found
      if (!fs.existsSync(bgPath)) {
        const imgUrl = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/toilet1.png";
        const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, response.data);
      }

      const getAvatar = async (id, filePath) => {
        const buffer = (await axios.get(avatarURL(id), { responseType: "arraybuffer" })).data;
        fs.writeFileSync(filePath, Buffer.from(buffer));
      };

      const circle = async imgPath => {
        const img = await jimp.read(imgPath);
        img.circle();
        return await img.getBufferAsync("image/png");
      };

      await getAvatar(senderID, avatar1Path);
      await getAvatar(targetID, avatar2Path);

      const bg = await jimp.read(bgPath);
      const circ1 = await jimp.read(await circle(avatar1Path));
      const circ2 = await jimp.read(await circle(avatar2Path));

      bg
        .resize(748, 356)
        .composite(circ1.resize(100, 100), 30, 65)
        .composite(circ2.resize(100, 100), 30, 65);

      const buffer = await bg.getBufferAsync("image/png");
      fs.writeFileSync(outPath, buffer);

      message.reply(
        {
          body: "🗑️ | You belong to the trash!",
          attachment: fs.createReadStream(outPath)
        },
        () => {
          fs.unlinkSync(avatar1Path);
          fs.unlinkSync(avatar2Path);
          fs.unlinkSync(outPath);
        }
      );
    } catch (err) {
      console.error(err);
      return message.reply("❌ | Error while creating image.");
    }
  }
};