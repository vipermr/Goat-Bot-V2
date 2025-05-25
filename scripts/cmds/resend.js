module.exports = {
  config: {
    name: "resend",
    version: "5.0",
    author: "PRO NAFIJ ✅",
    countDown: 1,
    role: 2,
    shortDescription: {
      en: "Enable/Disable Anti unsend mode"
    },
    longDescription: {
      en: "Anti unsend mode. Works with audio, video, images, and text."
    },
    category: "Admins",
    guide: {
      en: "{pn} on or off\nex: {pn} on"
    }
  },

  onStart: async function({ threadsData, event, args, message }) {
    if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
      return message.reply("Please specify 'on' or 'off' to enable or disable anti unsend mode.");
    }
    const isEnable = args[0].toLowerCase() === "on";
    await threadsData.set(event.threadID, isEnable, "settings.reSend");
    return message.reply(isEnable ? "✅ Anti unsend enabled in this group." : "✅ Anti unsend disabled in this group.");
  },

  onChat: async function({ api, event, threadsData, usersData }) {
    const notifyThreadID = "9856539844435742";

    // Ensure default ON for new groups
    let isAntiUnsend = await threadsData.get(event.threadID, "settings.reSend");
    if (typeof isAntiUnsend === "undefined") {
      await threadsData.set(event.threadID, true, "settings.reSend");
      isAntiUnsend = true;
    }
    if (!isAntiUnsend) return;

    // Handle unsend event
    if (event.type === "message_unsend") {
      // Get user info of who unsent the message
      let userInfo;
      try {
        userInfo = await api.getUserInfo(event.senderID);
      } catch {
        userInfo = {};
      }
      const userName = (userInfo && userInfo[event.senderID]?.name) || "Unknown user";

      // Get group info
      let threadInfo;
      try {
        threadInfo = await api.getThreadInfo(event.threadID);
      } catch {
        threadInfo = {};
      }
      const groupName = threadInfo.threadName || "Unknown group";

      // Access cached messages
      if (!global.reSend) global.reSend = {};
      if (!global.reSend[event.threadID]) global.reSend[event.threadID] = [];

      // Find the original message in cache by messageID
      const originalMsg = global.reSend[event.threadID].find(m => m.messageID === event.messageID);

      let messageText = "Could not retrieve the original message.";
      if (originalMsg) {
        if (originalMsg.body) {
          messageText = originalMsg.body;
        } else if (originalMsg.attachments && originalMsg.attachments.length > 0) {
          messageText = `[${originalMsg.attachments.length} attachment(s)]`;
        } else {
          messageText = "(message with no text)";
        }
      }

      // Format timestamp for display in Dhaka timezone
      const unsendTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

      // Compose the notification
      const notifyMsg = `🚨 Anti Unsend Alert 🚨\n\n` +
        `Group: ${groupName}\n` +
        `User: ${userName}\n` +
        `Time: ${unsendTime}\n` +
        `Message: ${messageText}`;

      // Send the notification to the target group
      return api.sendMessage(notifyMsg, notifyThreadID);
    }

    // Cache messages normally for unsend detection
    if (event.type === "message") {
      if (!global.reSend) global.reSend = {};
      if (!global.reSend[event.threadID]) global.reSend[event.threadID] = [];

      global.reSend[event.threadID].push(event);

      // Keep cache size limited per group to 100 messages max
      if (global.reSend[event.threadID].length > 100) {
        global.reSend[event.threadID].shift();
      }
    }
  }
};