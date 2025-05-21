async function checkShortCut(nickname, uid, usersData) {
	try {
		if (/{userName}/gi.test(nickname)) nickname = nickname.replace(/{userName}/gi, await usersData.getName(uid));
		if (/{userID}/gi.test(nickname)) nickname = nickname.replace(/{userID}/gi, uid);
		return nickname;
	}
	catch (e) {
		return nickname;
	}
}

module.exports = {
	config: {
		name: "setname",
		version: "1.6",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 0,
		description: {
			en: "Change nickname of yourself, tagged members, or all members using a format"
		},
		category: "box chat",
		guide: {
			en: {
				body: "   {pn} <nickname>: change your own nickname"
					+ "\n   {pn} @tag <nickname>: change nickname of tagged members"
					+ "\n   {pn} all <nickname>: change nickname of all members"
					+ "\n   {pn} [reply a message with format]: change nickname using replied content"
					+ "\n\nShortcuts available:"
					+ "\n   + {userName} - member's name"
					+ "\n   + {userID} - member's ID"
			}
		}
	},

	langs: {
		en: {
			error: "An error has occurred, try turning off the group invite link feature and try again.",
			done: "Changed nickname for %1 members."
		}
	},

	onStart: async function ({ args, message, event, api, usersData, getLang }) {
		const mentions = Object.keys(event.mentions);
		let uids = [];
		let nickname = args.join(" ");

		// Get nickname from replied message if none provided
		if (!nickname && event.messageReply?.body) {
			nickname = event.messageReply.body;
		}

		// Determine target users
		if (args[0] === "all") {
			uids = (await api.getThreadInfo(event.threadID)).participantIDs;
			nickname = args.slice(1).join(" ") || event.messageReply?.body || "";
		}
		else if (mentions.length) {
			uids = mentions;
			const allNames = new RegExp(
				Object.values(event.mentions)
					.map(name => name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
					.join("|"), "g"
			);
			nickname = nickname.replace(allNames, "").trim();
		}
		else {
			uids = [event.senderID];
			nickname = nickname.trim();
		}

		if (!nickname)
			return message.reply("Please provide a nickname or reply to a message containing the nickname format.");

		let changed = 0;
		for (const uid of uids) {
			try {
				await api.changeNickname(await checkShortCut(nickname, uid, usersData), event.threadID, uid);
				changed++;
			} catch (e) {}
		}

		return message.reply(getLang("done", changed));
	}
};