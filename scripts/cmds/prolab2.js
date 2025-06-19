module.exports = {
  config: {
    name: "prolab2",
    version: "1.0",
    author: "NAFIJ_PRO✅",
    description: "Listen to replies from admins with angry emojis, edit bot message & reply",
    role: 0,
    eventType: ["message"], // listen to all messages
    noPrefix: true ,// prefix-less command
    category: "system"
  },

  onStart: async () => {},

  onChat: async function ({ api, event }) {
    try {
      const { senderID, threadID, messageID, body, messageReply } = event;

      // Only proceed if this message is a reply to a bot message
      if (!messageReply || messageReply.senderID !== api.getCurrentUserID()) return;
      if (!body) return;

      // Emojis to trigger the action
      const triggerEmojis = ["😠", "😡", "🤬", "😤", "🙂"];
      if (!triggerEmojis.includes(body.trim())) return;

      // Check if sender is group admin or bot admin
      const threadInfo = await api.getThreadInfo(threadID);
      const isGroupAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
      const isBotAdmin = (global.GoatBot.config.ADMINBOT || []).includes(senderID);

      if (!isGroupAdmin && !isBotAdmin) return;

      // Edit the bot's original message (replied-to message)
      await api.editMessage("sorry 🤧😣", messageReply.messageID);

      // Send a random human-style reply
      const replies = [
        "Oii sorry re 🥹",
        "Na na boss, ami bhul kore felse 😣",
        "Bachao admin re 😭",
        "Ami thik korchi, chinta korben na 🫣",
        "Ektu raag komau 🙂💔",
        "Bujhlam ami pagol 😔",
        "Sotti boli, ebar aar hobe na 🥺",
        "Ar ekta chance deu na please 😭"
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      await api.sendMessage(replyText, threadID, messageID);
    } catch (err) {
      console.error("❌ prolab2 error:", err.message);
    }
  }
};
