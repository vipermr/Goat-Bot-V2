module.exports = {
  config: {
    name: "editmsg",
    aliases: ["🙂"],
    version: "1.0",
    author: "ChatGPT",
    role: 2, // Only bot admins
    shortDescription: {
      en: "Edit bot's message"
    },
    longDescription: {
      en: "Silently edit a message sent by the bot"
    },
    category: "system",
    guide: {
      en: "{pn} 🙂 new content (use by replying to bot message)"
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!event.messageReply || event.messageReply.senderID !== api.getCurrentUserID()) return;

    const newMsg = args.join(" ");
    if (!newMsg) return;

    try {
      await api.editMessage(newMsg, event.messageReply.messageID, event.threadID);
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  }
};