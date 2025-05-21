const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
	config: {
		name: "setleave",
		aliases: ["setl"],
		version: "2.0",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 0,
		description: "Edit leave message content, attachments, or toggle leave message on/off",
		category: "custom",
		guide: {
			en: `Usage:
  {pn} on - Enable leave message
  {pn} off - Disable leave message
  {pn} text <content> - Set leave message content
  {pn} text reset - Reset to default content
  {pn} file - Reply/send with image/video/audio to set leave attachment
  {pn} file reset - Remove attachment
  {pn} view - View current settings

Shortcuts:
  {userName} - Name of leaving user
  {userNameTag} - Name of leaving user (tag)
  {boxName} - Name of the group chat
  {type} - leave/kicked
  {session} - time of day`
		}
	},

	langs: {
		en: {
			turnedOn: "Leave message has been enabled.",
			turnedOff: "Leave message has been disabled.",
			missingContent: "Please enter the content.",
			edited: "Updated leave message to:\n%1",
			reseted: "Reset leave message content to default.",
			noFile: "No leave attachment exists.",
			resetedFile: "Leave attachment has been reset.",
			missingFile: "Reply with an image/video/audio to use as attachment.",
			addedFile: "Added %1 file(s) to leave message.",
			currentStatus: "Leave message: %1\nContent: %2\nAttachment: %3"
		}
	},

	onStart: async function ({ args, threadsData, message, event, commandName, getLang }) {
		const { threadID, senderID, body, messageReply, attachments } = event;
		const { data, settings } = await threadsData.get(threadID);
		const content = body.slice(body.indexOf(args[0]) + args[0].length).trim();

		switch (args[0]) {
			case "text": {
				if (!args[1]) return message.reply(getLang("missingContent"));
				if (args[1] === "reset") delete data.leaveMessage;
				else data.leaveMessage = content;
				await threadsData.set(threadID, { data });
				return message.reply(data.leaveMessage ? getLang("edited", data.leaveMessage) : getLang("reseted"));
			}

			case "file": {
				if (args[1] === "reset") {
					if (!data.leaveAttachment) return message.reply(getLang("noFile"));
					try {
						await Promise.all(data.leaveAttachment.map(id => drive.deleteFile(id)));
					} catch { }
					delete data.leaveAttachment;
					await threadsData.set(threadID, { data });
					return message.reply(getLang("resetedFile"));
				}

				const files = [...attachments, ...(messageReply?.attachments || [])].filter(a =>
					["photo", "animated_image", "video", "audio"].includes(a.type)
				);

				if (!files.length)
					return message.reply(getLang("missingFile"), (err, info) =>
						global.GoatBot.onReply.set(info.messageID, {
							messageID: info.messageID,
							author: senderID,
							commandName
						})
					);

				await handleAttachments(files, threadID, senderID, threadsData);
				return message.reply(getLang("addedFile", files.length));
			}

			case "on":
			case "off": {
				settings.sendLeaveMessage = args[0] === "on";
				await threadsData.set(threadID, { settings });
				return message.reply(getLang(args[0] === "on" ? "turnedOn" : "turnedOff"));
			}

			case "view": {
				const status = settings.sendLeaveMessage ? "Enabled" : "Disabled";
				const text = data.leaveMessage || "Not set";
				const hasFile = data.leaveAttachment?.length ? "Yes" : "No";
				return message.reply(getLang("currentStatus", status, text, hasFile));
			}

			default:
				return message.SyntaxError();
		}
	},

	onReply: async function ({ event, Reply, message, threadsData, getLang }) {
		if (event.senderID !== Reply.author) return;
		const files = [...event.attachments, ...(event.messageReply?.attachments || [])].filter(a =>
			["photo", "animated_image", "video", "audio"].includes(a.type)
		);
		if (!files.length) return message.reply(getLang("missingFile"));
		await handleAttachments(files, event.threadID, event.senderID, threadsData);
		message.reply(getLang("addedFile", files.length));
	}
};

async function handleAttachments(attachments, threadID, senderID, threadsData) {
	const { data } = await threadsData.get(threadID);
	if (!data.leaveAttachment) data.leaveAttachment = [];

	for (const file of attachments) {
		const ext = getExtFromUrl(file.url);
		const name = `leave_${threadID}_${senderID}_${getTime()}.${ext}`;
		const info = await drive.uploadFile(name, await getStreamFromURL(file.url));
		data.leaveAttachment.push(info.id);
	}
	await threadsData.set(threadID, { data });
}