const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "wholesome",
    aliases: ["wsome"],
    version: "1.1",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    shortDescription: "Wholesome avatar effect",
    longDescription: "Generate a wholesome image with your crush or lover",
    category: "fun",
    guide: "{pn} @mention or reply to a user's message"
  },

  onStart: async function ({ message, event }) {
    let targetID;

    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      targetID = event.messageReply.senderID;
    } else {
      return message.reply("Please mention or reply to a user's message to use this command.");
    }

    try {
      const imagePath = await generateWholesomeImage(targetID);
      await message.reply({
        body: "「 is that true? 🥰❤️ 」",
        attachment: fs.createReadStream(imagePath)
      });
    } catch (err) {
      console.error(err);
      return message.reply("An error occurred while generating the image.");
    }
  }
};

async function generateWholesomeImage(uid) {
  const avatar = await jimp.read(`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const bg = await jimp.read("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/wholesome.jpg");
  bg.resize(512, 512).composite(avatar.resize(173, 173), 70, 186);
  const outputPath = "wholesome.png";
  await bg.writeAsync(outputPath);
  return outputPath;
}