const fs = require("fs");
const vipPath = "vip.json";

function loadVIP() {
	try {
		return JSON.parse(fs.readFileSync(vipPath));
	} catch {
		return {};
	}
}

function saveVIP(data) {
	fs.writeFileSync(vipPath, JSON.stringify(data, null, 2));
}

module.exports = {
	config: {
		name: "vipfont",
		version: "1.1",
		author: "NAFIJ",
		countDown: 3,
		role: 2, // Admin only
		shortDescription: "Add/remove VIP font users",
		longDescription: "Add, remove or list VIP users allowed to use the font command",
		category: "admin",
		guide: "{pn} add @user/reply/uid\n{pn} remove @user/reply/uid\n{pn} list"
	},

	onStart: async function ({ args, event, api }) {
		const data = loadVIP();
		const action = args[0];

		if (!action) return api.sendMessage(
			"Usage:\n• {pn} add @user/reply/uid\n• {pn} remove @user/reply/uid\n• {pn} list",
			event.threadID
		);

		if (action === "list") {
			const ids = Object.keys(data);
			if (ids.length === 0) return api.sendMessage("No VIP Font users yet.", event.threadID);

			const names = await Promise.all(ids.map(id =>
				api.getUserInfo(id).then(res => res[id]?.name || id).catch(() => id)
			));

			let list = names.map((name, index) => `${index + 1}. ${name}`).join("\n");
			return api.sendMessage(`VIP Font Users (${names.length}):\n${list}`, event.threadID);
		}

		let targetID = null;

		if (event.messageReply) {
			targetID = event.messageReply.senderID;
		} else if (event.mentions && Object.keys(event.mentions).length > 0) {
			targetID = Object.keys(event.mentions)[0];
		} else if (!isNaN(args[1])) {
			targetID = args[1];
		} else {
			return api.sendMessage("❗ Please tag, reply, or enter a valid UID.", event.threadID);
		}

		if (action === "add") {
			data[targetID] = true;
			saveVIP(data);
			const name = (await api.getUserInfo(targetID))[targetID]?.name || "User";
			return api.sendMessage(`✅ ${name} is now a VIP Font user!`, event.threadID);
		}

		if (action === "remove") {
			if (!data[targetID]) return api.sendMessage("❌ User is not in the VIP Font list.", event.threadID);
			delete data[targetID];
			saveVIP(data);
			const name = (await api.getUserInfo(targetID))[targetID]?.name || "User";
			return api.sendMessage(`🗑️ ${name} removed from VIP Font list.`, event.threadID);
		}

		api.sendMessage("⚠️ Invalid action! Use: add / remove / list", event.threadID);
	}
};