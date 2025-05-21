const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;
const checkUrlRegex = /(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

module.exports = {
  config: {
    name: "setrankup",
    version: "1.3",
    author: "NAFIJ_PRO( MODED )",
    countDown: 0,
    role: 0,
    description: "Configure rankup message and attachments",
    category: "owner",
    guide: {
      en: `Use this command to configure the rankup message and file.
- {pn} text <message>: Set rankup message
  - Available tags: {userName}, {userNameTag}, {oldRank}, {currentRank}
- {pn} file <url> (or send as reply): Add attachment to rankup
- {pn} reset: Reset message and attachments to default`
    }
  },

  langs: {
    en: {
      changedMessage: "✅ Rankup message updated to:\n%1",
      missingAttachment: "❗ You must attach a file or provide a valid link.",
      changedAttachment: "✅ Successfully added %1 attachment(s) to rankup.",
      resetSuccess: "✅ Rankup message and attachments have been reset."
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang }) {
    const { threadID, senderID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData.data.rankup) threadData.data.rankup = {};
    const rankupData = threadData.data.rankup;

    switch (args[0]) {
      case "text": {
        const newMessage = event.body.slice(event.body.indexOf("text") + 5).trim();
        if (!newMessage) return message.reply("Please provide a message.");
        rankupData.message = newMessage;
        await threadsData.set(threadID, threadData.data);
        return message.reply(getLang("changedMessage", newMessage));
      }

      case "file":
      case "image":
      case "video":
      case "mp3": {
        const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])]
          .filter(a => ["photo", "animated_image", "video", "audio"].includes(a.type));

        if (!attachments.length && !(args[1] || "").match(checkUrlRegex))
          return message.reply(getLang("missingAttachment"));

        if (!rankupData.attachments) rankupData.attachments = [];

        let count = 0;

        for (const att of attachments) {
          const url = att.url;
          const ext = getExtFromUrl(url);
          const fileName = `${getTime()}.${ext}`;
          const file = await drive.uploadFile(`rankup_${threadID}_${senderID}_${fileName}`, await getStreamFromURL(url));
          rankupData.attachments.push(file.id);
          count++;
        }

        if (args[1] && args[1].match(checkUrlRegex)) {
          const url = args[1];
          const ext = getExtFromUrl(url);
          const fileName = `${getTime()}.${ext}`;
          const file = await drive.uploadFile(`rankup_${threadID}_${senderID}_${fileName}`, await getStreamFromURL(url));
          rankupData.attachments.push(file.id);
          count++;
        }

        await threadsData.set(threadID, threadData.data);
        return message.reply(getLang("changedAttachment", count));
      }

      case "reset": {
        delete threadData.data.rankup;
        await threadsData.set(threadID, threadData.data);
        return message.reply(getLang("resetSuccess"));
      }

      default:
        return message.SyntaxError();
    }
  }
};