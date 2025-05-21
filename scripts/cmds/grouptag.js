module.exports = {
	config: {
		name: "grouptag",
		aliases: ["grtag"],
		version: "2.0",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 0,
		category: "group",
		description: "Tag members using saved groups",
		guide: {
			en: "{pn} usage: show all usage options"
		}
	},

	langs: {
		en: {
			noGroupTagName: "Please enter group tag name.",
			noMention: "You haven't tagged any member to add to group tag.",
			addedSuccess: "Added members to group tag \"%1\":\n%2",
			addedSuccess2: "Created group tag \"%1\" with members:\n%2",
			existedInGroupTag: "Members:\n%1\nalready existed in group tag \"%2\"",
			notExistedInGroupTag: "Members:\n%1\ndo not exist in group tag \"%2\"",
			noExistedGroupTag: "Group tag \"%1\" does not exist.",
			noExistedGroupTag2: "No group tags found in this chat.",
			noMentionDel: "Please tag members to remove from group tag \"%1\".",
			deletedSuccess: "Removed members:\n%1\nfrom group tag \"%2\"",
			deletedSuccess2: "Deleted group tag \"%1\"",
			tagged: "Tag group \"%1\":\n%2",
			noGroupTagName2: "Please enter old group name and new name separated by `|`.",
			renamedSuccess: "Renamed group tag \"%1\" to \"%2\"",
			infoGroupTag: "📑 Group: %1\n👥 Members: %2\n👨‍👩‍👧‍👦 List:\n %3",
			usage:
				"Usage:\n" +
				"- {pn} add <groupName> <@tags>\n" +
				"- {pn} del <groupName> <@tags>\n" +
				"- {pn} remove <groupName>\n" +
				"- {pn} tag <groupName>\n" +
				"- {pn} rename <oldName> | <newName>\n" +
				"- {pn} info <groupName>\n" +
				"- {pn} list\n" +
				"- {pn} usage"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		const { threadID, mentions } = event;
		for (const uid in mentions)
			mentions[uid] = mentions[uid].replace("@", "");
		const groupTags = await threadsData.get(threadID, "data.groupTags", []);

		if (!args[0] || args[0] === "usage")
			return message.reply(getLang("usage"));

		switch (args[0]) {
			case "add": {
				const mentionsID = Object.keys(mentions);
				if (mentionsID.length === 0) return message.reply(getLang("noMention"));

				const content = args.slice(1).join(" ");
				const groupTagName = content.slice(0, content.indexOf(event.mentions[mentionsID[0]]) - 1).trim();
				if (!groupTagName) return message.reply(getLang("noGroupTagName"));

				const existing = groupTags.find(tag => tag.name.toLowerCase() === groupTagName.toLowerCase());
				if (existing) {
					const alreadyIn = [], newlyAdded = [];
					for (const uid in mentions) {
						if (existing.users[uid]) alreadyIn.push(uid);
						else {
							existing.users[uid] = mentions[uid];
							newlyAdded.push(uid);
						}
					}
					await threadsData.set(threadID, groupTags, "data.groupTags");
					let msg = "";
					if (newlyAdded.length) msg += getLang("addedSuccess", existing.name, newlyAdded.map(uid => mentions[uid]).join("\n")) + "\n";
					if (alreadyIn.length) msg += getLang("existedInGroupTag", alreadyIn.map(uid => mentions[uid]).join("\n"), existing.name);
					message.reply(msg);
				} else {
					const newGroup = { name: groupTagName, users: mentions };
					groupTags.push(newGroup);
					await threadsData.set(threadID, groupTags, "data.groupTags");
					message.reply(getLang("addedSuccess2", groupTagName, Object.values(mentions).join("\n")));
				}
				break;
			}

			case "del": {
				const mentionsID = Object.keys(mentions);
				if (mentionsID.length === 0) return message.reply(getLang("noMentionDel", "unknown"));
				const content = args.slice(1).join(" ");
				const groupTagName = content.slice(0, content.indexOf(mentions[mentionsID[0]]) - 1).trim();
				if (!groupTagName) return message.reply(getLang("noGroupTagName"));
				const group = groupTags.find(t => t.name.toLowerCase() === groupTagName.toLowerCase());
				if (!group) return message.reply(getLang("noExistedGroupTag", groupTagName));

				const removed = [], notFound = [];
				for (const uid in mentions) {
					if (group.users[uid]) {
						delete group.users[uid];
						removed.push(uid);
					} else {
						notFound.push(uid);
					}
				}
				await threadsData.set(threadID, groupTags, "data.groupTags");
				let msg = "";
				if (notFound.length) msg += getLang("notExistedInGroupTag", notFound.map(uid => mentions[uid]).join("\n"), groupTagName) + "\n";
				if (removed.length) msg += getLang("deletedSuccess", removed.map(uid => mentions[uid]).join("\n"), groupTagName);
				message.reply(msg);
				break;
			}

			case "remove":
			case "rm": {
				const groupName = args.slice(1).join(" ").trim();
				if (!groupName) return message.reply(getLang("noGroupTagName"));
				const index = groupTags.findIndex(g => g.name.toLowerCase() === groupName.toLowerCase());
				if (index === -1) return message.reply(getLang("noExistedGroupTag", groupName));
				groupTags.splice(index, 1);
				await threadsData.set(threadID, groupTags, "data.groupTags");
				message.reply(getLang("deletedSuccess2", groupName));
				break;
			}

			case "rename": {
				const content = args.slice(1).join(" ");
				const [oldName, newName] = content.split("|").map(str => str.trim());
				if (!oldName || !newName) return message.reply(getLang("noGroupTagName2"));
				const group = groupTags.find(g => g.name.toLowerCase() === oldName.toLowerCase());
				if (!group) return message.reply(getLang("noExistedGroupTag", oldName));
				group.name = newName;
				await threadsData.set(threadID, groupTags, "data.groupTags");
				message.reply(getLang("renamedSuccess", oldName, newName));
				break;
			}

			case "info": {
				const name = args.slice(1).join(" ").trim();
				if (!name) return message.reply(getLang("noGroupTagName"));
				const group = groupTags.find(g => g.name.toLowerCase() === name.toLowerCase());
				if (!group) return message.reply(getLang("noExistedGroupTag", name));
				showInfoGroupTag(message, group, getLang);
				break;
			}

			case "list":
			case "all": {
				if (!groupTags.length) return message.reply(getLang("noExistedGroupTag2"));
				let msg = "";
				for (const group of groupTags)
					msg += `\n\n${group.name}:\n ${Object.values(group.users).join("\n ")}`;
				message.reply(msg.trim());
				break;
			}

			case "tag":
			default: {
				const name = args.slice(args[0] === "tag" ? 1 : 0).join(" ").trim();
				if (!name) return message.reply(getLang("noGroupTagName"));
				const group = groupTags.find(g => g.name.toLowerCase() === name.toLowerCase());
				if (!group) return message.reply(getLang("noExistedGroupTag", name));
				const mentionsArr = [];
				let msg = "";
				for (const uid in group.users) {
					mentionsArr.push({ id: uid, tag: group.users[uid] });
					msg += `${group.users[uid]}\n`;
				}
				message.reply({ body: getLang("tagged", group.name, msg), mentions: mentionsArr });
			}
		}
	}
};

function showInfoGroupTag(message, groupTag, getLang) {
	message.reply(getLang("infoGroupTag", groupTag.name, Object.keys(groupTag.users).length, Object.values(groupTag.users).join("\n ")));
}