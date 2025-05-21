const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "vip",
		version: "1.6",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 2,
		shortDescription: {
			en: "Add, remove, or list VIP users"
		},
		longDescription: {
			en: "Manage VIP user roles by adding, removing, or listing them"
		},
		category: "box chat",
		guide: {
			en: '{pn} [add | -a] <uid | @tag | reply>\n{pn} [remove | -r] <uid | @tag | reply>\n{pn} [list | -l]'
		}
	},

	langs: {
		en: {
			added: "✅ | Added VIP role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users already have VIP role:\n%2",
			missingIdAdd: "⚠️ | Please mention, reply or provide UID to add VIP role",
			removed: "✅ | Removed VIP role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users don't have VIP role:\n%2",
			missingIdRemove: "⚠️ | Please mention, reply or provide UID to remove VIP role",
			listAdmin: "👑 | List of VIPs:\n%1",
			noPermission: "❌ | You don't have permission to use this command."
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		const permission = global.GoatBot.config.GOD;
		if (!permission.includes(event.senderID)) {
			return message.reply(getLang("noPermission"), event.messageID);
		}

		const { threadID, messageID, mentions, messageReply } = event;
		let uids = [];

		if (["add", "-a"].includes(args[0])) {
			if (Object.keys(mentions).length > 0) {
				uids = Object.keys(mentions);
			} else if (messageReply) {
				uids.push(messageReply.senderID);
			} else {
				uids = args.slice(1).filter(arg => !isNaN(arg));
			}

			if (uids.length === 0) return message.reply(getLang("missingIdAdd"), messageID);

			const notAdminIds = [], vipIds = [];
			for (const uid of uids) {
				if (config.vipUser.includes(uid)) vipIds.push(uid);
				else notAdminIds.push(uid);
			}

			config.vipUser.push(...notAdminIds);
			const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
			writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
			return message.reply(
				(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(({ uid }) => notAdminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
				+ (vipIds.length > 0 ? getLang("alreadyAdmin", vipIds.length, vipIds.map(uid => `• ${uid}`).join("\n")) : "")
			);
		}

		if (["remove", "-r"].includes(args[0])) {
			if (Object.keys(mentions).length > 0) {
				uids = Object.keys(mentions);
			} else if (messageReply) {
				uids.push(messageReply.senderID);
			} else {
				uids = args.slice(1).filter(arg => !isNaN(arg));
			}

			if (uids.length === 0) return message.reply(getLang("missingIdRemove"), messageID);

			const notAdminIds = [], vipIds = [];
			for (const uid of uids) {
				if (config.vipUser.includes(uid)) vipIds.push(uid);
				else notAdminIds.push(uid);
			}

			for (const uid of vipIds) config.vipUser.splice(config.vipUser.indexOf(uid), 1);
			const getNames = await Promise.all(vipIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
			writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
			return message.reply(
				(vipIds.length > 0 ? getLang("removed", vipIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
				+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
			);
		}

		if (["list", "-l"].includes(args[0])) {
			const getNames = await Promise.all(config.vipUser.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
			return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")), messageID);
		}

		return message.SyntaxError();
	}
};