const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "pronotice",
    aliases: ["pnotice"],
    version: "1.7",
    author: "NAFIJ PRO ✅",
    countDown: 5,
    role: 2,
    category: "pro",
    shortDescription: "Send notice from admin to all groups",
    guide: "{pn} <message>"
  },

  onStart: async function({ message, api, event, args, envCommands, threadsData }) {
    const delayPerGroup = envCommands?.pronotice?.delayPerGroup || 250;

    // Prepare message and attachments to send
    let formSend;

    if (event.messageReply) {
      // If replying to a message, send the replied message content + attachments
      formSend = {
        body: `NOTICE FROM NAFIJ 🙂🤲🏼\n────────────────\n${event.messageReply.body || ""}`,
        attachment: await getStreamsFromAttachment(event.messageReply.attachments || [])
      };
    } else {
      if (!args.length) return message.reply("Please enter the message you want to send to all groups.");
      // Send text + current message attachments if any
      formSend = {
        body: `NOTICE FROM NAFIJ 🙂🤲🏼\n────────────────\n${args.join(" ")}`,
        attachment: await getStreamsFromAttachment(event.attachments || [])
      };
    }

    // Get all groups bot is member of
    const allThreads = (await threadsData.getAll()).filter(thread =>
      thread.isGroup && thread.members.some(m => m.userID == api.getCurrentUserID() && m.inGroup)
    );

    if (allThreads.length === 0) return message.reply("Bot is not in any group.");

    message.reply(`Start sending notice to ${allThreads.length} groups...`);

    let successCount = 0;
    const failedThreads = [];

    for (const thread of allThreads) {
      try {
        await api.sendMessage(formSend, thread.threadID);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (error) {
        failedThreads.push({ threadID: thread.threadID, error: error.message || "Unknown error" });
      }
    }

    let replyMsg = `✅ Sent to ${successCount} groups successfully.\n`;
    if (failedThreads.length) {
      replyMsg += `❌ Failed to send to ${failedThreads.length} groups:\n`;
      for (const fail of failedThreads) {
        replyMsg += `• ${fail.error} - ThreadID: ${fail.threadID}\n`;
      }
    }
    message.reply(replyMsg);
  }
};