const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "buttslap",
    version: "1.2",
    author: "Ullash ッ & NAFIJ",
    countDown: 5,
    role: 0,
    shortDescription: "Buttslap image",
    longDescription: "Generate buttslap meme using two avatars",
    category: "meme",
    guide: {
      en: "{pn} @tag\nOr reply to someone's message"
    }
  },

  langs: {
    en: {
      noTarget: "You must tag someone or reply to their message."
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    let uid1 = event.senderID;
    let uid2;

    // Prioritize reply first
    if (event.type === "message_reply") {
      uid2 = event.messageReply.senderID;
    }
    // If not replied, check mention
    else if (Object.keys(event.mentions).length > 0) {
      uid2 = Object.keys(event.mentions)[0];
    }

    // If no target found
    if (!uid2 || uid1 === uid2)
      return message.reply(getLang("noTarget"));

    try {
      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);
      const img = await new DIG.Spank().getImage(avatarURL1, avatarURL2);

      const pathSave = `${__dirname}/tmp/${uid1}_${uid2}_spank.png`;
      fs.writeFileSync(pathSave, Buffer.from(img));

      const content = args.join(" ").replace(/@.+/, "").trim() || "hehe boii";
      message.reply({
        body: content,
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));
    } catch (err) {
      console.error("Error generating buttslap image:", err);
      message.reply("An error occurred while generating the image.");
    }
  }
};