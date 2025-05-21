const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "cooom",
    aliases: ["coom"],
    version: "1.2",
    author: "Samir + Modified by NAFIJ",
    countDown: 5,
    role: 0,
    shortdescription: "Make fun of your friends",
    longDescription: "Make fun of your friends using crazy cooom fails",
    category: "fun",
    guide: "{pn} @tag or reply to a message"
  },

  onStart: async function ({ message, event, api }) {
    let uid;

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply" && event.messageReply.senderID) {
      uid = event.messageReply.senderID;
    }

    if (!uid) {
      return message.reply("Tag someone or reply to a message to use this command!");
    }

    const funnyMessages = [
      "Oops! CoOOM failed harder than your WiFi signal!",
      "When protection goes wrong... again!",
      "This is why we can’t have nice things!",
      "Cooom malfunction level: legendary!",
      "Guess who's gonna be a parent? Not really, just kidding!"
    ];

    const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

    try {
      const imagePath = await generateImage(uid);
      await message.reply({
        body: randomMsg,
        attachment: fs.createReadStream(imagePath)
      });
    } catch (error) {
      console.error("Error while running cooom command:", error);
      await message.reply("Something went wrong while creating the image. Try again later.");
    }
  }
};

async function generateImage(uid) {
  const avatar = await jimp.read(`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const baseImage = await jimp.read("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/coooom.jpg");

  baseImage.resize(512, 512).composite(avatar.resize(263, 263), 256, 258);
  const outputPath = "cooom.png";
  await baseImage.writeAsync(outputPath);
  return outputPath;
}