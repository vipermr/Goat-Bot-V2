const axios = require("axios");

module.exports = {
  config: {
    name: "profile",
    aliases: ["pp"],
    version: "1.3",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    shortDescription: "Get Facebook profile picture",
    longDescription: "Fetch profile picture via tag, reply, self or facebook.com link",
    category: "image",
    guide: {
      en: "{pn} @tag\n{pn} (reply to message)\n{pn} (your own profile)\n{pn} facebook.com/username"
    }
  },

  onStart: async function ({ event, message, usersData, args }) {
    let targetID;

    // Facebook link input
    if (args[0] && args[0].includes("facebook.com")) {
      try {
        const res = await axios.get(`https://graph.facebook.com/v18.0/${args[0].split("facebook.com/")[1]}?fields=id&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`);
        targetID = res.data.id;
      } catch (err) {
        return message.reply("Failed to fetch user from Facebook link. Make sure the profile is public.");
      }
    }

    // If reply
    else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    // If tag
    else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    // Default to self
    else {
      targetID = event.senderID;
    }

    try {
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=720&height=720`;
      return message.reply({
        body: "Here is the profile picture:",
        attachment: await global.utils.getStreamFromURL(avatarURL)
      });
    } catch (e) {
      return message.reply("Error getting profile picture. Please try again.");
    }
  }
};