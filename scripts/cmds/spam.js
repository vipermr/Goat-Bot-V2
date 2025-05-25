module.exports = {
  config: {
    name: "spam",
    author: "kim/zed", // Convert By Goatbot Zed
    role: 2,
    shortDescription: "Spam messages (authorized users only)",
    longDescription: "",
    category: "sophia",
    guide: "{pn} [amount] [message]"
  },

  onStart: async function ({ api, event, args }) {
    const authorizedUsers = ["100058371606434", "100058371606435"];

    if (!authorizedUsers.includes(event.senderID)) {
      return api.sendMessage("❌ You are not authorized to use this command.", event.threadID, event.messageID);
    }

    const amount = parseInt(args[0]);
    const message = args.slice(1).join(" ");

    if (isNaN(amount) || !message) {
      return api.sendMessage("❌ Invalid usage.\nUsage: /spam [amount] [message]", event.threadID, event.messageID);
    }

    for (let i = 0; i < amount; i++) {
      api.sendMessage(message, event.threadID);
    }
  }
};