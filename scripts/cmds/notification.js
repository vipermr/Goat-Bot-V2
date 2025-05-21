const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "1.7",
    author: "NTKhang (Modified by NAFIJ_PRO)",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Send notification from admin to all groups"
    },
    longDescription: {
      en: "Broadcast a message with optional media to all group chats from the bot admin"
    },
    category: "owner",
    guide: {
      en: "{pn} <message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingMessage: "⚠️ Please enter the message you want to send to all groups.",
      notification: "【 ADMIN BROADCAST 】",
      sendingNotification: "📢 Sending message to %1 groups...",
      sentNotification: "✅ Notification sent successfully to %1 groups.",
      errorSendingNotification: "❌ Failed to send to %1 groups:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];

    if (!args[0]) return message.reply(getLang("missingMessage"));

    const formSend = {
      body: `${getLang("notification")}\n━━━━━━━━━━━━━━\n${args.join(" ")}\n━━━━━━━━━━━━━━\n— Sent by: NAFIJ_PRO`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item =>
          ["photo", "png", "animated_image", "video", "audio"].includes(item.type)
        )
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(t =>
      t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
    );

    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSuccess = 0;
    const sendError = [];
    const waitingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;
      try {
        waitingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (e) {
        sendError.push(tid);
      }
    }

    for (const sended of waitingSend) {
      try {
        await sended.pending;
        sendSuccess++;
      } catch (e) {
        const { errorDescription } = e;
        const existingError = sendError.find(item => item.errorDescription == errorDescription);
        if (existingError) {
          existingError.threadIDs.push(sended.threadID);
        } else {
          sendError.push({
            errorDescription,
            threadIDs: [sended.threadID]
          });
        }
      }
    }

    let msg = "";
    if (sendSuccess > 0)
      msg += getLang("sentNotification", sendSuccess) + "\n";
    if (sendError.length > 0)
      msg += getLang(
        "errorSendingNotification",
        sendError.reduce((a, b) => a + b.threadIDs.length, 0),
        sendError.reduce((a, b) => a + `\n - ${b.errorDescription}\n   + ${b.threadIDs.join("\n   + ")}`, "")
      );

    message.reply(msg);
  }
};