const fs = require("fs-extra");

module.exports = {
	config: {
		name: "setlang",
		version: "2.0",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 0,
		description: "Set default language of the bot for this chat or globally",
		category: "owner",
		guide: {
			en: `Usage:
  {pn} <language code ISO 639-1> - Set language for current chat
  {pn} <language code> -g       - Set language globally (admin only)
Examples:
  {pn} en
  {pn} vi -g`
		}
	},

	langs: {
		en: {
			setLangForAll: "Set default language of the bot to: %1",
			setLangForCurrent: "Set default language for this chat: %1",
			noPermission: "Only bot admins can use this command.",
			langNotFound: "Language not found: %1"
		}
	},

	onStart: async function ({ message, args, getLang, threadsData, role, event }) {
		if (!args[0]) return message.SyntaxError();

		let langCode = args[0].toLowerCase();
		if (langCode === "default" || langCode === "reset") langCode = null;

		const isGlobal = ["-g", "-global", "all"].includes(args[1]?.toLowerCase());

		if (isGlobal) {
			if (role < 2) return message.reply(getLang("noPermission"));

			const pathLang = `${process.cwd()}/languages/${langCode}.lang`;
			if (!fs.existsSync(pathLang)) return message.reply(getLang("langNotFound", langCode));

			const languageData = fs.readFileSync(pathLang, "utf-8")
				.split(/\r?\n|\r/)
				.filter(line => line && !line.trim().startsWith("#") && !line.trim().startsWith("//"));

			global.language = {};
			for (const line of languageData) {
				const sep = line.indexOf('=');
				const keyFull = line.slice(0, sep).trim();
				const value = line.slice(sep + 1).trim().replace(/\\n/g, '\n');
				const [group, ...rest] = keyFull.split('.');
				const key = rest.join('.');
				if (!global.language[group]) global.language[group] = {};
				global.language[group][key] = value;
			}

			global.GoatBot.config.language = langCode;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("setLangForAll", langCode || "default"));
		}

		await threadsData.set(event.threadID, langCode, "data.lang");
		return message.reply(getLang("setLangForCurrent", langCode || "default"));
	}
};