const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
  config: {
    name: "setwelcome",
    aliases: ["setwc"],
    version: "2.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 1,
    description: "Edit welcome message content and media",
    category: "custom",
    guide: {
      en: `Usage:
{pn} text <message> - set welcome message
{pn} text reset - reset welcome message
{pn} file - reply with image/video/audio to attach media
{pn} file reset - remove all attached files
{pn} on/off - enable or disable welcome feature

Shortcuts:
{userName} - new member's name
{userNameTag} - new member (tagged)
{boxName} - group name
{multiple} - "you"/"you all"
{session} - session in day`
    }
  },

  langs: {
    en: {
      turnedOn: "Welcome message enabled.",
      turnedOff: "Welcome message disabled.",
      missingContent: "Please enter a welcome message.",
      edited: "Updated welcome message to:\n%1",
      reseted: "Welcome message reset to default.",
      noFile: "No welcome attachment to delete.",
      resetedFile: "Welcome attachment(s) deleted.",
      missingFile: "Reply to this message with image/video/audio.",
      addedFile: "Added %1 welcome file(s)."
    }
  },

  onStart: async function ({ args, threadsData, message, event, commandName, getLang }) {
    const { threadID, senderID, body } = event;
    const { data, settings } = await threadsData.get(threadID);

    switch (args[0]) {
      case "text": {
        if (!args[1]) return message.reply(getLang("missingContent"));

        if (args[1] === "reset") {
          delete data.welcomeMessage;
          await threadsData.set(threadID, { data });
          return message.reply(getLang("reseted"));
        }

        const newMsg = body.slice(body.indexOf(args[0]) + args[0].length).trim();
        data.welcomeMessage = newMsg;
        await threadsData.set(threadID, { data });
        return message.reply(getLang("edited", newMsg));
      }

      case "file": {
        if (args[1] === "reset") {
          if (!data.welcomeAttachment) return message.reply(getLang("noFile"));
          try {
            await Promise.all(data.welcomeAttachment.map(id => drive.deleteFile(id)));
          } catch (e) {}
          delete data.welcomeAttachment;
          await threadsData.set(threadID, { data });
          return message.reply(getLang("resetedFile"));
        }

        if (
          event.attachments.length === 0 &&
          (!event.messageReply || event.messageReply.attachments.length === 0)
        ) {
          return message.reply(getLang("missingFile"), (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              messageID: info.messageID,
              author: senderID,
              commandName
            });
          });
        }

        saveAttachments(message, event, threadID, senderID, threadsData, getLang);
        break;
      }

      case "on":
      case "off": {
        settings.sendWelcomeMessage = args[0] === "on";
        await threadsData.set(threadID, { settings });
        return message.reply(settings.sendWelcomeMessage ? getLang("turnedOn") : getLang("turnedOff"));
      }

      default:
        return message.SyntaxError();
    }
  },

  onReply: async function ({ event, Reply, message, threadsData, getLang }) {
    const { threadID, senderID } = event;
    if (senderID !== Reply.author) return;
    if (
      event.attachments.length === 0 &&
      (!event.messageReply || event.messageReply.attachments.length === 0)
    ) {
      return message.reply(getLang("missingFile"));
    }
    saveAttachments(message, event, threadID, senderID, threadsData, getLang);
  }
};

async function saveAttachments(message, event, threadID, senderID, threadsData, getLang) {
  const { data } = await threadsData.get(threadID);
  const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])]
    .filter(att => ["photo", "png", "animated_image", "video", "audio"].includes(att.type));

  if (!data.welcomeAttachment) data.welcomeAttachment = [];

  await Promise.all(attachments.map(async attachment => {
    const { url } = attachment;
    const ext = getExtFromUrl(url);
    const fileName = `${getTime()}.${ext}`;
    const fileInfo = await drive.uploadFile(`setwelcome_${threadID}_${senderID}_${fileName}`, await getStreamFromURL(url));
    data.welcomeAttachment.push(fileInfo.id);
  }));

  await threadsData.set(threadID, { data });
  message.reply(getLang("addedFile", attachments.length));
}