module.exports = {
  config: {
    name: "japan",
    version: "1.0.0",
    hasPermission: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Random Japan Girl Image",
    commandCategory: "Random-IMG",
    usages: "japan",
    cooldowns: 5
  },

  onStart: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const request = require("request");

    const links = [
      "https://i.imgur.com/fwUBSqv.jpg",
      "https://i.imgur.com/Yj6ZHiL.jpg",
      "https://i.imgur.com/WR5uNY8.jpg",
      "https://i.imgur.com/Wc1GtyQ.jpg",
      "https://i.imgur.com/sXet1Cb.jpg",
      "https://i.imgur.com/2Z1cT0C.jpg",
      "https://i.imgur.com/UaXhcld.jpg",
      "https://i.imgur.com/48rV8lP.jpg",
      "https://i.imgur.com/MU5K9yF.jpg",
      "https://i.imgur.com/QCW4uZ0.jpg"
    ];

    const randomImage = links[Math.floor(Math.random() * links.length)];
    const imagePath = __dirname + "/cache/japan.jpg";

    try {
      request(randomImage)
        .pipe(fs.createWriteStream(imagePath))
        .on("close", () => {
          api.sendMessage(
            {
              body: `✅ **Random Japan Girl Image**\n🖼️ Total Images: ${links.length}`,
              attachment: fs.createReadStream(imagePath)
            },
            event.threadID,
            () => fs.unlinkSync(imagePath),
            event.messageID
          );
        });

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ | কিছু সমস্যা হয়েছে, পরে আবার চেষ্টা করো!", event.threadID, event.messageID);
    }
  }
};
