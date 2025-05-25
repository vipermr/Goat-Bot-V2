const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "toilet",
    aliases: ["toilet"],
    version: "1.4",
    author: "NAFIJ x ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Put someone on toilet",
    longDescription: "Mention or reply someone to put them on the toilet",
    category: "fun",
    guide: "{pn} @mention\n{pn} (reply to someone)",
  },

  onStart: async function ({ message, event }) {
    let target;

    if (event.messageReply) {
      target = event.messageReply.senderID;
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
      target = Object.keys(event.mentions)[0];
    } else {
      return message.reply("❌ Mention or reply someone to put them on toilet.");
    }

    if (target === "100058371606434") {
      return message.reply("Koto Boro Sahos 🙂💩");
    }

    try {
      const imgPath = await makeToiletImage(target);
      message.reply({
        body: "You Deserve This Place 🤣",
        attachment: fs.createReadStream(imgPath)
      });
    } catch (e) {
      console.error(e);
      message.reply("❌ Failed to generate toilet image.");
    }
  }
};

async function makeToiletImage(uid) {
  const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const avatar = await jimp.read(avatarURL);
  avatar.circle();

  const background = await jimp.read("https://i.imgur.com/sZW2vlz.png");
  background.resize(1080, 1350)
    .composite(avatar.resize(450, 450), 300, 660); // target face on toilet

  const outputPath = __dirname + "/cache/toilet_result.png";
  await background.writeAsync(outputPath);
  return outputPath;
}