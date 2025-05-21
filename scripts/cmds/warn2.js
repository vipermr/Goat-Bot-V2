module.exports = {
  config: {
    name: "warn2",
    version: "2.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Warn a user for breaking rules"
    },
    longDescription: {
      en: "Issue warnings to users. Automatically bans when max warnings are reached."
    },
    category: "moderation",
    guide: {
      en: "{pn} @tag [reason] or reply a message with: {pn} [reason]\n{pn} list - Show warning list"
    }
  },

  onStart: async function ({ message, event, args, usersData, threadsData, api }) {
    const warnLimit = 3; // max warning level before auto-ban
    const threadID = event.threadID;
    const senderID = event.senderID;
    let targetID, reason;

    if (args[0] === "list") {
      const warns = await threadsData.get(threadID, "warns", {});
      if (!warns || Object.keys(warns).length === 0)
        return message.reply("No users have warnings yet.");

      let listMsg = "Warning List:\n";
      for (const [uid, count] of Object.entries(warns)) {
        const name = await usersData.getName(uid);
        listMsg += `• ${name} (${uid}): ${count} warning(s)\n`;
      }
      return message.reply(listMsg);
    }

    // Get target by tag or reply
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      reason = args.slice(1).join(" ") || "No reason provided.";
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      reason = args.join(" ") || "No reason provided.";
    } else {
      return message.reply("Please tag a user or reply to a message to warn.");
    }

    if (targetID === senderID)
      return message.reply("You can't warn yourself.");

    // Update warning count
    let warns = await threadsData.get(threadID, "warns", {});
    warns[targetID] = (warns[targetID] || 0) + 1;

    await threadsData.set(threadID, "warns", warns);

    const warnedName = await usersData.getName(targetID);
    const warnCount = warns[targetID];

    message.reply(
      `${warnedName} has been warned.\nReason: ${reason}\nTotal warnings: ${warnCount}/${warnLimit}`
    );

    // Auto-ban if limit reached
    if (warnCount >= warnLimit) {
      try {
        await api.removeUserFromGroup(targetID, threadID);
        message.send(`${warnedName} has been removed from the group after reaching ${warnLimit} warnings.`);
        delete warns[targetID];
        await threadsData.set(threadID, "warns", warns);
      } catch (e) {
        message.send(`Failed to remove ${warnedName}. Check bot permissions.`);
      }
    }
  }
};