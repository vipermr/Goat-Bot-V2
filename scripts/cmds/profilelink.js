module.exports = {
  config: {
    name: "profilelink",
    aliases: ["pfplink", "ppl"],
    version: "1.2",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    description: "Get the Facebook profile link of a user",
    category: "info",
    guide: {
      en: "{pn} @mention\n{pn} reply\n{pn} <userID>\n{pn} (for your own profile)"
    }
  },

  onStart: async function ({ event, message, args }) {
    let targetUID;

    if (event.type === "message_reply") {
      targetUID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else if (args[0]) {
      targetUID = args[0];
    } else {
      targetUID = event.senderID;
    }

    const profileLink = `https://facebook.com/${targetUID}`;
    return message.reply(`🔗 | Facebook Profile Link:\n${profileLink}`);
  }
};