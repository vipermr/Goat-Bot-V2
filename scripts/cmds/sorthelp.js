module.exports = {
	config: {
		name: "sorthelp",
		version: "1.3",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 0,
		description: {
			en: "Sort help list by name or category"
		},
		category: "system",
		guide: {
			en: "{pn} [name | category] — Sort help menu alphabetically or by category"
		}
	},

	langs: {
		en: {
			savedName: "✅ Help list sorting is now set to alphabetical (A-Z).\n⚡ Powered by NAFIJ.",
			savedCategory: "✅ Help list sorting is now set to category grouping.\n⚡ Powered by NAFIJ.",
			syntaxError: "❌ Invalid option. Please use: name or category."
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		const option = args[0]?.toLowerCase();
		if (option === "name") {
			await threadsData.set(event.threadID, "name", "settings.sortHelp");
			return message.reply(getLang("savedName"));
		}
		else if (option === "category") {
			await threadsData.set(event.threadID, "category", "settings.sortHelp");
			return message.reply(getLang("savedCategory"));
		}
		else {
			return message.reply(getLang("syntaxError"));
		}
	}
};