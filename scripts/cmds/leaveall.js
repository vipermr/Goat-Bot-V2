module.exports = {
  config: {
    name: "leaveall",
    author: "cliff (modded by NAFIJ_PRO)",
    version: "1.5.1",
    countDown: 10,
    role: 0,
    category: "Admin",
    shortDescription: {
      en: "Leave all groups"
    }
  },

  onStart: async function ({ api, event }) {
    const allowedUID = "100058371606434";

    if (event.senderID !== allowedUID) {
      return api.sendMessage("❌ You are not authorized to use this command.", event.threadID, event.messageID);
    }

    try {
      api.getThreadList(100, null, ["INBOX"], (err, list) => {
        if (err) return api.sendMessage("❌ Failed to fetch thread list.", event.threadID, event.messageID);

        list.forEach(item => {
          if (item.isGroup && item.threadID !== event.threadID) {
            api.removeUserFromGroup(api.getCurrentUserID(), item.threadID);
          }
        });

        api.sendMessage("✅ Successfully left all other groups.", event.threadID, event.messageID);
      });
    } catch (error) {
      api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
    }
  }
};