module.exports = {
  config: {
    name: "refreshinfo",
    version: "2.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 10,
    role: 0,
    shortDescription: "Refresh user or group info",
    longDescription: "Refresh info of group or user by command, ID or message reply",
    category: "box chat",
    guide: {
      en:
        "{pn} group: Refresh current group info\n" +
        "{pn} group <threadID>: Refresh group by ID\n" +
        "{pn} user: Refresh your user info\n" +
        "{pn} user <userID>: Refresh user by ID\n" +
        "{pn} user @tag: Refresh tagged user\n" +
        "{pn} user (reply): Refresh user from replied message\n" +
        "{pn} group (reply): Refresh group from replied message\n" +
        "{pn}usage: Show usage guide"
    }
  },

  onStart: async function ({ args, threadsData, message, event, usersData, commandName }) {
    const { messageReply } = event;

    if (args[0] === "usage") {
      return message.reply(
        `Usage for "${commandName}":\n\n` +
        `• ${commandName} group: Refresh current group info\n` +
        `• ${commandName} group <threadID>: Refresh group by ID\n` +
        `• ${commandName} group (reply): Refresh group of replied message\n` +
        `• ${commandName} user: Refresh your user info\n` +
        `• ${commandName} user <userID>: Refresh user by ID\n` +
        `• ${commandName} user @tag: Refresh tagged user\n` +
        `• ${commandName} user (reply): Refresh user of replied message`
      );
    }

    const replyThreadID = messageReply?.threadID;
    const replySenderID = messageReply?.senderID;

    // Refresh group logic
    if (args[0] === "group" || args[0] === "thread") {
      const targetID = args[1] || replyThreadID || event.threadID;
      try {
        await threadsData.refreshInfo(targetID);
        return message.reply(
          `✅ Group info for threadID ${targetID} refreshed successfully!`
        );
      } catch {
        return message.reply(`❌ Failed to refresh group info for threadID ${targetID}.`);
      }
    }

    // Refresh user logic
    if (args[0] === "user") {
      let targetID = event.senderID;
      if (args[1]) {
        if (Object.keys(event.mentions).length)
          targetID = Object.keys(event.mentions)[0];
        else targetID = args[1];
      } else if (replySenderID) {
        targetID = replySenderID;
      }

      try {
        await usersData.refreshInfo(targetID);
        return message.reply(
          `✅ User info for ID ${targetID} refreshed successfully!`
        );
      } catch {
        return message.reply(`❌ Failed to refresh user info for ID ${targetID}.`);
      }
    }

    // No args = default group refresh
    try {
      await threadsData.refreshInfo(event.threadID);
      return message.reply("✅ Group info refreshed (default) successfully!");
    } catch {
      return message.reply("❌ Failed to refresh group info (default).");
    }
  }
};