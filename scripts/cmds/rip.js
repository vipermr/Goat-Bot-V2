const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "rip",
    version: "1.2",
    author: "MILAN",
    countDown: 5,
    role: 0,
    shortDescription: "Generate RIP image",
    longDescription: "Generate RIP tombstone with user's avatar (via tag or reply)",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | reply]",
      en: "{pn} [@tag | reply]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    let uid;

    // Check if message is a reply
    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    }
    // Otherwise, check if someone was tagged
    else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else {
      return message.reply("Please mention someone or reply to their message.");
    }

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Rip().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_Rip.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));
      return message.reply({
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));
    } catch (err) {
      console.error(err);
      return message.reply("An error occurred while generating the RIP image.");
    }
  }
};