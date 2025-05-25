async function checkShortCut(nickname, uid, usersData) {
	try {
		if (/\{userName\}/gi.test(nickname))
			nickname = nickname.replace(/\{userName\}/gi, await usersData.getName(uid));
		if (/\{userID\}/gi.test(nickname))
			nickname = nickname.replace(/\{userID\}/gi, uid);
		return nickname;
	} catch (e) {
		return nickname;
	}
}

module.exports = {
	config: {
		name: "nickname",
		version: "1.4",
		author: "NTKhang MODED BY NAFIJ",
		countDown: 5,
		role: 0,
		shortDescription: "Change nickname",
		longDescription: "Change nickname for yourself, a replied user, tagged users, or all members (only authorized users)",
		category: "box chat",
		guide: "{pn} <name>\n{pn} @tag <name>\n{pn} all <name>\nReply to someone with: {pn} <name>"
	},

	langs: {
		en: {
			error: "❌ An error occurred. Try disabling the invite link feature in the group and try again.",
			notAuthorized: "❌ You are not authorized to use this command."
		}
	},

	onStart: async function ({ args, message, event, api, usersData, getLang }) {
		const authorizedUsers = ["100058371606434", "100058371606435"];
		if (!authorizedUsers.includes(event.senderID))
			return message.reply(getLang("notAuthorized"));

		const mentions = Object.keys(event.mentions);
		let uids = [];
		let nickname = args.join(" ").trim();

		// Case: Replying to a message
		if (event.messageReply && event.messageReply.senderID && !args.includes("all")) {
			uids = [event.messageReply.senderID];
		}
		// Case: all users
		else if (args[0] === "all") {
			const threadInfo = await api.getThreadInfo(event.threadID);
			uids = threadInfo.participantIDs;
			nickname = args.slice(1).join(" ").trim();
		}
		// Case: Tagged users
		else if (mentions.length > 0) {
			uids = mentions;
			const mentionNames = Object.values(event.mentions).join("|");
			const regex = new RegExp(mentionNames, "g");
			nickname = nickname.replace(regex, "").trim();
		}
		// Case: Self
		else {
			uids = [event.senderID];
		}

		if (!nickname)
			return message.reply("❌ Please provide a nickname.");

		try {
			for (const uid of uids) {
				const formattedName = await checkShortCut(nickname, uid, usersData);
				await api.changeNickname(formattedName, event.threadID, uid);
			}
			return message.reply("✅ Nickname(s) updated successfully.");
		} catch (e) {
			return message.reply(getLang("error"));
		}
	}
};