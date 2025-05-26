const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    version: "1.1.0",
    hasPermission: 0,
    credits: "NAFIJ",
    description: "Slap a user by tagging or replying",
    category: "fun",
    usages: "slap @user / reply",
    cooldowns: 5
  },

  onStart: async function ({ api, event }) {
    try {
      let targetID, targetName;

      // If user replies to a message
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
        const userInfo = await api.getUserInfo(targetID);
        targetName = userInfo[targetID].name;
      }
      // If user tags someone
      else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
        targetName = event.mentions[targetID];
      } else {
        return api.sendMessage("❌ Tag someone or reply to their message to slap them!", event.threadID, event.messageID);
      }

      const response = await axios.get("https://api.waifu.pics/sfw/slap");
      const imageURL = response.data.url;
      const ext = path.extname(imageURL);
      const imagePath = path.join(__dirname, "cache", `slap_${targetID}${ext}`);

      await downloadImage(imageURL, imagePath);

      return api.sendMessage({
        body: `👋 *Slapped ${targetName}*\n\nJustified... probably.`,
        mentions: [{ tag: targetName, id: targetID }],
        attachment: fs.createReadStream(imagePath)
      }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Something went wrong while slapping!", event.threadID, event.messageID);
    }
  }
};

// Helper function to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    request(url)
      .pipe(fs.createWriteStream(filepath))
      .on("close", resolve)
      .on("error", reject);
  });
}
