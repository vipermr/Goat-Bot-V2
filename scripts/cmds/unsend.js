module.exports = {
  config: {
    name: "uns",
    aliases: ["unsend", "u", "removemsg", "delmsg"],
    version: "1.2",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    description: {
      en: "Unsend the bot's message"
    },
    category: "box chat",
    guide: {
      en: "Reply to the message you want to unsend and use {pn}"
    }
  },

  langs: {
    en: {
      syntaxError: "⚠️ | Please reply to a bot message you want to unsend!"
    }
  },

  onStart: async function ({ message, event, api, getLang }) {
    if (!event.messageReply || event.messageReply.senderID != api.getCurrentUserID())
      return message.reply(getLang("syntaxError"));
    message.unsend(event.messageReply.messageID);
  }
};