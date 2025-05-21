const { getTime } = global.utils;

module.exports = {
	config: {
		name: "user",
		version: "1.5",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 2,
		description: "Manage users in bot system",
		category: "owner",
		guide: {
			en: "   {pn} [find | -f | search | -s] <name>: Search for users by name\n"
				+ "   {pn} [ban | -b] [<uid> | @tag | reply] <reason>: Ban a user\n"
				+ "   {pn} unban [<uid> | @tag | reply]: Unban a user"
		}
	},

	langs: {
		en: {
			noUserFound: "❌ No user found with name: \"%1\"",
			userFound: "🔎 Found %1 user(s) with name \"%2\":\n%3",
			uidRequired: "⚠️ Please tag, reply to a user, or enter their UID.",
			reasonRequired: "⚠️ Please provide a reason to ban the user.",
			userHasBanned: "User [%1 | %2] is already banned:\n» Reason: %3\n» Date: %4",
			userBanned: "User [%1 | %2] has been banned.\n» Reason: %3\n» Date: %4",
			uidRequiredUnban: "⚠️ Please tag, reply to a user, or enter their UID to unban.",
			userNotBanned: "User [%1 | %2] is not banned.",
			userUnbanned: "User [%1 | %2] has been unbanned."
		}
	},

	onStart: async function ({ args, usersData, message, event, getLang }) {
		const type = args[0];
		switch (type) {
			case "find":
			case "-f":
			case "search":
			case "-s": {
				const keyword = args.slice(1).join(" ");
				if (!keyword) return message.reply("Please enter a name to search.");
				const allUser = await usersData.getAll();
				const result = allUser.filter(u => (u.name || "").toLowerCase().includes(keyword.toLowerCase()));
				if (result.length === 0) return message.reply(getLang("noUserFound", keyword));
				const msg = result.map(u => `╭Name: ${u.name}\n╰ID: ${u.userID}`).join("\n");
				message.reply(getLang("userFound", result.length, keyword, msg));
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
					reason = args.slice(1).join(" ").replace(event.mentions[uid], "").trim();
				} else if (!isNaN(args[1])) {
					uid = args[1];
					reason = args.slice(2).join(" ");
				}

				if (!uid) return message.reply(getLang("uidRequired"));
				if (!reason) return message.reply(getLang("reasonRequired"));

				const userData = await usersData.get(uid);
				const name = userData.name;
				if (userData.banned?.status)
					return message.reply(getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date));

				const time = getTime("DD/MM/YYYY HH:mm:ss");
				await usersData.set(uid, {
					banned: {
						status: true,
						reason,
						date: time
					}
				});
				message.reply(getLang("userBanned", uid, name, reason, time));
				break;
			}

			case "unban":
			case "-u": {
				let uid;

				if (event.type === "message_reply") {
					uid = event.messageReply.senderID;
				} else if (Object.keys(event.mentions).length > 0) {
					uid = Object.keys(event.mentions)[0];
				} else if (!isNaN(args[1])) {
					uid = args[1];
				}

				if (!uid) return message.reply(getLang("uidRequiredUnban"));
				const userData = await usersData.get(uid);
				const name = userData.name;
				if (!userData.banned?.status) return message.reply(getLang("userNotBanned", uid, name));
				await usersData.set(uid, { banned: {} });
				message.reply(getLang("userUnbanned", uid, name));
				break;
			}

			default: return message.SyntaxError();
		}
	}
};