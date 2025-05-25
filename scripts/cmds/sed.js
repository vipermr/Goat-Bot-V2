const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "sed",
    aliases: ["fun"],
    version: "1.1",
    author: "Upen Basnet + Fixed by ChatGPT",
    countDown: 5,
    role: 2,
    shortDescription: "Fun image with profile pics",
    longDescription: "Generates a meme using avatars of mentioned/replied users",
    category: "fun",
    guide: "{pn} [@tag | reply]"
  },

  onStart: async function ({ message, event }) {
    let uid1 = event.senderID;
    let uid2;

    if (event.type === "message_reply") {
      uid2 = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid2 = Object.keys(event.mentions)[0];
    } else {
      return message.reply("Please mention someone or reply to their message.");
    }

    try {
      const imgPath = await generateImage(uid1, uid2);
      return message.reply({
        body: "tbh we both enjoyed🫣🥹",
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));
    } catch (e) {
      console.error(e);
      return message.reply("Error generating the image.");
    }
  }
};

async function generateImage(uid1, uid2) {
  const avatar1 = await jimp.read(`https://graph.facebook.com/${uid1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const avatar2 = await jimp.read(`https://graph.facebook.com/${uid2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

  avatar1.circle();
  avatar2.circle();

  const baseImg = await jimp.read("https://i.imgur.com/16HRsN6.jpg");
  baseImg.resize(1080, 1350)
    .composite(avatar1.resize(140, 140), 790, 420)
    .composite(avatar2.resize(250, 250), 300, 320);

  const path = `${__dirname}/tmp/sed_${uid1}_${uid2}.png`;
  await baseImg.writeAsync(path);
  return path;
}