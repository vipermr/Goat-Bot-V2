const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const allowedUsers = ["100058371606434", "100076392488331", "1234", "123"];

module.exports = {
  config: {
    name: "fck",
    aliases: ["fk"],
    version: "1.0",
    author: "pro🥺",
    countDown: 5,
    role: 0,
    shortDescription: "",
    longDescription: "",
    category: "owner",
    guide: "{pn} @mention or reply"
  },

  onStart: async function ({ message, event }) {
    const senderID = event.senderID;

    // Check if sender is allowed
    if (!allowedUsers.includes(senderID)) {
      return message.reply("You are not allowed to use this command.");
    }

    let one, two;

    // If reply
    if (event.messageReply) {
      one = senderID;
      two = event.messageReply.senderID;
    }
    // If mention
    else if (Object.keys(event.mentions).length > 0) {
      const mention = Object.keys(event.mentions);
      if (mention.length === 1) {
        one = senderID;
        two = mention[0];
      } else {
        one = mention[1];
        two = mention[0];
      }
    } else {
      return message.reply("Please mention someone or reply to their message.");
    }

    try {
      const imgPath = await bal(one, two);
      message.reply(
        { body: "「 Harder daddy 🥵💦 」", attachment: fs.createReadStream(imgPath) },
        () => fs.unlinkSync(imgPath)
      );
    } catch (e) {
      console.error(e);
      message.reply("Failed to generate image.");
    }
  }
};

async function bal(one, two) {
  const avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

  avone.circle();
  avtwo.circle();

  const img = await jimp.read("https://i.ibb.co/YpR7Bpv/image.jpg");
  img.resize(639, 480)
     .composite(avone.resize(90, 90), 23, 320)
     .composite(avtwo.resize(100, 100), 110, 60);

  const outPath = path.join(__dirname, "fucked_temp.png");
  await img.writeAsync(outPath);
  return outPath;
}