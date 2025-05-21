module.exports = {
  config: {
    name: "kick",
    version: "1.4",
    author: "NTKhang (Modified by NAFIJ_PRO)",
    countDown: 5,
    role: 1,
    shortDescription: "Kick members from group",
    longDescription: "Kick a tagged or replied member out of the group",
    category: "box chat",
    guide: {
      en: "{pn} @tag\n{pn} (reply to message)"
    }
  },

  langs: {
    en: {
      needAdmin: "❌ Please make the bot an admin before using this command.",
      noTarget: "⚠️ Please tag or reply to the person you want to kick.",
      kickFail: "❌ Failed to kick some users (maybe bot is not admin or permission denied).",
      kickSuccess: "✅ Successfully kicked the mentioned/replied user(s)."
    }
  },

  onStart: async function ({ message, event, args, threadsData, api, getLang }) {
    const threadID = event.threadID;
    const botID = api.getCurrentUserID();
    const adminIDs = await threadsData.get(threadID, "adminIDs") || [];

    if (!adminIDs.includes(botID))
      return message.reply(getLang("needAdmin"));

    let userIDsToKick = [];

    // From reply
    if (event.messageReply && !args[0]) {
      userIDsToKick.push(event.messageReply.senderID);
    }

    // From mentions
    const mentionIDs = Object.keys(event.mentions);
    if (mentionIDs.length > 0) {
      userIDsToKick.push(...mentionIDs);
    }

    if (userIDsToKick.length === 0)
      return message.reply(getLang("noTarget") + `\n\nUsage:\n${this.config.guide.en.replace(/{pn}/g, "/" + this.config.name)}`);

    let failed = [];
    for (const uid of userIDsToKick) {
      try {
        await api.removeUserFromGroup(uid, threadID);
      } catch (err) {
        failed.push(uid);
      }
    }

    if (failed.length === userIDsToKick.length)
      return message.reply(getLang("kickFail"));
    if (failed.length > 0)
      return message.reply(getLang("kickSuccess") + `\n❗ Some users could not be removed.`);
    
    return message.reply(getLang("kickSuccess"));
  }
};