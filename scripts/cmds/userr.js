const { getTime } = global.utils;

module.exports = {
	config: {
		name: "userr",
		version: "2.0",
		author: "NTKhang & NAFIJ",
		countDown: 5,
		role: 2,
		description: "Manage users in the bot system",
		category: "owner",
		guide: {
			en:
				"   {pn} find <name> - Search users by name\n" +
				"   {pn} ban <uid/@tag/reply> <reason> - Ban a user\n" +
				"   {pn} unban <uid/@tag/reply> - Unban a user\n" +
				"   {pn} list - Show list of banned users"
		}
	},

	langs: {
		en: {
			noUserFound: "❌ No user found with name: \"%1\"",
			userFound: "🔎 Found %1 user(s) with name \"%2\":\n%3",
			uidRequired: "❌ Please provide a UID, tag a user, or reply to a message.",
			reasonRequired: "❌ Please provide a reason for banning.",
			userHasBanned: "⚠️ User [%1 | %2] is already banned:\n» Reason: %3\n» Date: %4",
			userBanned: "✅ User [%1 | %2] has been banned.\n» Reason: %3\n» Date: %4",
			uidRequiredUnban: "❌ Please provide a UID, tag a user, or reply to a message.",
			userNotBanned: "❎ User [%1 | %2] is not banned.",
			userUnbanned: "✅ User [%1 | %2] has been unbanned.",
			noBannedUsers: "✅ There are no banned users.",
			bannedList: "📄 List of banned users:\n%1"
		}
	},

	onStart: async function ({ args, usersData, message, event, getLang }) {
		const type = args[0];

		switch (type) {
			case "find":
			case "-f":
			case "search":
			case "-s": {
				const keyWord = args.slice(1).join(" ");
				const allUser = await usersData.getAll();
				const result = allUser.filter(u => (u.name || "").toLowerCase().includes(keyWord.toLowerCase()));
				const msg = result.map(u => `╭Name: ${u.name}\n╰ID: ${u.userID}`).join("\n");
				message.reply(result.length === 0
					? getLang("noUserFound", keyWord)
					: getLang("userFound", result.length, keyWord, msg));
				break;
			}

			case "ban":
			case "-b": {
				let uid, reason;
				if (event.type === "message_reply") {
					uid = event.messageReply.senderID;
					reason = args.slice(1).join(" ");
				} else if (Object.keys(event.mentions).length > 0) {
					uid = Object.keys(event.mentions)[0];
					reason = args.slice(1).join(" ").replace(event.mentions[uid], "");
				} else if (args[1]) {
					uid = args[1];
					reason = args.slice(2).join(" ");
				}
				if (!uid) return message.reply(getLang("uidRequired"));
				if (!reason) return message.reply(getLang("reasonRequired"));
				reason = reason.trim();

				const userData = await usersData.get(uid);
				const name = userData.name || "Unknown";
				if (userData.banned?.status)
					return message.reply(getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date));

				const date = getTime("DD/MM/YYYY HH:mm:ss");
				await usersData.set(uid, {
					banned: {
						status: true,
						reason,
						date
					}
				});
				message.reply(getLang("userBanned", uid, name, reason, date));
				break;
			}

			case "unban":
			case "-u": {
				let uid;
				if (event.type === "message_reply") {
					uid = event.messageReply.senderID;
				} else if (Object.keys(event.mentions).length > 0) {
					uid = Object.keys(event.mentions)[0];
				} else if (args[1]) {
					uid = args[1];
				}
				if (!uid) return message.reply(getLang("uidRequiredUnban"));

				const userData = await usersData.get(uid);
				const name = userData.name || "Unknown";
				if (!userData.banned?.status)
					return message.reply(getLang("userNotBanned", uid, name));

				await usersData.set(uid, { banned: {} });
				message.reply(getLang("userUnbanned", uid, name));
				break;
			}

			case "list": {
				const allUser = await usersData.getAll();
				const bannedUsers = allUser.filter(u => u.banned?.status);
				if (bannedUsers.length === 0) return message.reply(getLang("noBannedUsers"));

				const msg = bannedUsers.map((u, i) =>
					`${i + 1}. ${u.name} | ${u.userID}\n   Reason: ${u.banned.reason}\n   Date: ${u.banned.date}`
				).join("\n\n");
				message.reply(getLang("bannedList", msg));
				break;
			}

			default:
				return message.SyntaxError();
		}
	}
};