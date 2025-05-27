const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "kiss2",
    aliases: ["kiss2"],
    version: "2.0",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    shortDescription: "KISS with swapped avatars",
    longDescription: "",
    category: "funny",
    guide: "{pn} @mention or reply"
  },

  onStart: async function ({ api, message, event, args, usersData }) {
    try {
      const mention = Object.keys(event.mentions);
      const replyID = event.messageReply?.senderID;

      if (mention.length === 0 && !replyID) {
        return message.reply("Please mention someone or reply to their message.");
      }

      let me = event.senderID;
      let target;

      if (mention.length > 0) {
        target = mention[0];  // Target on the LEFT
      } else if (replyID) {
        target = replyID;     // Target on the LEFT
      }

      if (!me || !target) {
        return message.reply("Couldn't determine both users for the kiss.");
      }

      // Fetch avatars
      const avatarTarget = await usersData.getAvatarUrl(target);
      const avatarMe = await usersData.getAvatarUrl(me);

      // Generate image with target on LEFT and me on RIGHT (swapped order)
      const imgBuffer = await new DIG.Kiss().getImage(avatarTarget, avatarMe);
      const tmpPath = path.join(__dirname, "tmp", `${me}_${target}_kiss2.png`);

      await fs.outputFile(tmpPath, Buffer.from(imgBuffer));

      // Reply with updated success message
      message.reply({
        body: `Kiss sent successfully to ${event.mentions[target]?.replace(/@/, "") || "the user"}!`,
        attachment: fs.createReadStream(tmpPath)
      }, () => fs.unlinkSync(tmpPath));
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to generate kiss image.");
    }
  }
};