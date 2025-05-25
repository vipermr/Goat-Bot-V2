module.exports = {
	config: {
		name: "role",
		version: "1.4",
		author: "NTKhang (Modified by ChatGPT)",
		countDown: 5,
		role: 1,
		shortDescription: "Manage command roles",
		longDescription: "Set, view, or reset the role requirement of commands (only for commands with role < 2)",
		category: "info",
		guide: "{pn} role view <commandName>\n{pn} role set <0|1> <commandName>\n{pn} role reset <commandName>"
	},

	langs: {
		en: {
			noEditedCommand: "✅ No commands have been edited in this group.",
			editedCommand: "⚠️ Edited commands:\n",
			noPermission: "❗ Only admins can use this command.",
			commandNotFound: "Command \"%1\" not found.",
			noChangeRole: "❗ Cannot change the role of command \"%1\".",
			resetRole: "✅ Reset the role of command \"%1\" to default.",
			changedRole: "✅ Changed the role of command \"%1\" to %2.",
			currentRole: "🔍 Current role of \"%1\" is: %2."
		}
	},

	onStart: async function ({ message, event, args, role, threadsData, getLang }) {
		const { commands, aliases } = global.GoatBot;
		const setRole = await threadsData.get(event.threadID, "data.setRole", {});

		if (role < 1)
			return message.reply(getLang("noPermission"));

		const subCommand = args[0];
		const value = args[1];
		const commandNameInput = args[2]?.toLowerCase();

		// view
		if (subCommand === "view") {
			if (!commandNameInput)
				return message.reply(getLang("noEditedCommand"));

			const command = commands.get(commandNameInput) || commands.get(aliases.get(commandNameInput));
			if (!command)
				return message.reply(getLang("commandNotFound", commandNameInput));

			const name = command.config.name;
			const currentRole = setRole[name] ?? command.config.role;
			return message.reply(getLang("currentRole", name, currentRole));
		}

		// reset
		if (subCommand === "reset") {
			if (!value)
				return message.reply("❌ Please specify a command to reset.");
			const command = commands.get(value) || commands.get(aliases.get(value));
			if (!command)
				return message.reply(getLang("commandNotFound", value));

			const name = command.config.name;
			if (command.config.role > 1)
				return message.reply(getLang("noChangeRole", name));

			delete setRole[name];
			await threadsData.set(event.threadID, setRole, "data.setRole");
			return message.reply(getLang("resetRole", name));
		}

		// set
		if (subCommand === "set") {
			if (!["0", "1"].includes(value) || !commandNameInput)
				return message.reply("❌ Usage: role set <0|1> <commandName>");

			const command = commands.get(commandNameInput) || commands.get(aliases.get(commandNameInput));
			if (!command)
				return message.reply(getLang("commandNotFound", commandNameInput));

			const name = command.config.name;
			if (command.config.role > 1)
				return message.reply(getLang("noChangeRole", name));

			setRole[name] = parseInt(value);
			await threadsData.set(event.threadID, setRole, "data.setRole");
			return message.reply(getLang("changedRole", name, value));
		}

		return message.reply("❌ Invalid usage. Use: role view/set/reset <args>");
	}
};