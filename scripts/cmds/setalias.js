module.exports = {
	config: {
		name: "setalias",
		version: "1.8",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			en: "Add or remove command aliases for your group or system"
		},
		category: "config",
		guide: {
			en:
				"Use to add/remove alias for any command\n\n" +
				"• {pn} add <alias> <command>: add alias in this group\n" +
				"• {pn} add <alias> <command> -g: add alias globally (bot admin only)\n" +
				"• Example: {pn} add hi help\n\n" +
				"• {pn} rm <alias> <command>: remove alias in this group\n" +
				"• {pn} rm <alias> <command> -g: remove alias globally (bot admin only)\n" +
				"• Example: {pn} rm hi help\n\n" +
				"• {pn} list: view aliases in this group\n" +
				"• {pn} list -g: view global aliases"
		}
	},

	langs: {
		en: {
			commandNotExist: "❌ Command \"%1\" does not exist.",
			aliasExist: "⚠️ Alias \"%1\" already exists for command \"%2\" in the system.",
			addAliasSuccess: "✅ Added alias \"%1\" for command \"%2\" in the system. 😀",
			noPermissionAdd: "❌ You don't have permission to add alias \"%1\" for command \"%2\" globally.",
			aliasIsCommand: "⚠️ Alias \"%1\" is already a command name.",
			aliasExistInGroup: "⚠️ Alias \"%1\" already exists for command \"%2\" in this group.",
			addAliasToGroupSuccess: "✅ Added alias \"%1\" for command \"%2\" in this group. 😀",
			aliasNotExist: "❌ Alias \"%1\" does not exist for command \"%2\".",
			removeAliasSuccess: "✅ Removed alias \"%1\" from command \"%2\" in the system. 😀",
			noPermissionDelete: "❌ You don't have permission to remove alias \"%1\" for command \"%2\" globally.",
			noAliasInGroup: "❌ Command \"%1\" has no aliases in this group.",
			removeAliasInGroupSuccess: "✅ Removed alias \"%1\" from command \"%2\" in this group. 😀",
			aliasList: "📜 Global aliases:\n%1",
			noAliasInSystem: "⚠️ There are no global aliases.",
			notExistAliasInGroup: "⚠️ No aliases are set for this group.",
			aliasListInGroup: "📜 Group aliases:\n%1"
		}
	},

	onStart: async function ({ message, event, args, threadsData, globalData, role, getLang }) {
		const aliasesData = await threadsData.get(event.threadID, "data.aliases", {});

		switch (args[0]) {
			case "add": {
				if (!args[2]) return message.SyntaxError();
				const commandName = args[2].toLowerCase();
				const alias = args[1].toLowerCase();

				if (!global.GoatBot.commands.has(commandName))
					return message.reply(getLang("commandNotExist", commandName));

				if (args[3] === "-g") {
					if (role > 1) {
						const globalAliasesData = await globalData.get("setalias", "data", []);
						const globalAliasExists = globalAliasesData.find(item => item.aliases.includes(alias));
						if (globalAliasExists)
							return message.reply(getLang("aliasExist", alias, globalAliasExists.commandName));
						if (global.GoatBot.aliases.has(alias))
							return message.reply(getLang("aliasExist", alias, global.GoatBot.aliases.get(alias)));

						const commandEntry = globalAliasesData.find(data => data.commandName === commandName);
						if (commandEntry) commandEntry.aliases.push(alias);
						else globalAliasesData.push({ commandName, aliases: [alias] });

						await globalData.set("setalias", globalAliasesData, "data");
						global.GoatBot.aliases.set(alias, commandName);
						return message.reply(getLang("addAliasSuccess", alias, commandName));
					} else return message.reply(getLang("noPermissionAdd", alias, commandName));
				}

				if (global.GoatBot.commands.has(alias))
					return message.reply(getLang("aliasIsCommand", alias));
				if (global.GoatBot.aliases.has(alias))
					return message.reply(getLang("aliasExist", alias, global.GoatBot.aliases.get(alias)));
				for (const cmd in aliasesData)
					if (aliasesData[cmd].includes(alias))
						return message.reply(getLang("aliasExistInGroup", alias, cmd));

				const list = aliasesData[commandName] || [];
				list.push(alias);
				aliasesData[commandName] = list;
				await threadsData.set(event.threadID, aliasesData, "data.aliases");
				return message.reply(getLang("addAliasToGroupSuccess", alias, commandName));
			}

			case "remove":
			case "rm": {
				if (!args[2]) return message.SyntaxError();
				const commandName = args[2].toLowerCase();
				const alias = args[1].toLowerCase();

				if (!global.GoatBot.commands.has(commandName))
					return message.reply(getLang("commandNotExist", commandName));

				if (args[3] === "-g") {
					if (role > 1) {
						const globalAliasesData = await globalData.get("setalias", "data", []);
						const commandEntry = globalAliasesData.find(data => data.commandName === commandName);
						if (!commandEntry || !commandEntry.aliases.includes(alias))
							return message.reply(getLang("aliasNotExist", alias, commandName));

						commandEntry.aliases = commandEntry.aliases.filter(a => a !== alias);
						await globalData.set("setalias", globalAliasesData, "data");
						global.GoatBot.aliases.delete(alias);
						return message.reply(getLang("removeAliasSuccess", alias, commandName));
					} else return message.reply(getLang("noPermissionDelete", alias, commandName));
				}

				if (!aliasesData[commandName])
					return message.reply(getLang("noAliasInGroup", commandName));
				if (!aliasesData[commandName].includes(alias))
					return message.reply(getLang("aliasNotExist", alias, commandName));

				aliasesData[commandName] = aliasesData[commandName].filter(a => a !== alias);
				await threadsData.set(event.threadID, aliasesData, "data.aliases");
				return message.reply(getLang("removeAliasInGroupSuccess", alias, commandName));
			}

			case "list": {
				if (args[1] === "-g") {
					const globalAliasesData = await globalData.get("setalias", "data", []);
					if (!globalAliasesData.length)
						return message.reply(getLang("noAliasInSystem"));

					const result = globalAliasesData.map(entry => `• ${entry.commandName}: ${entry.aliases.join(", ")}`).join("\n");
					return message.reply(getLang("aliasList", result));
				}

				if (!Object.keys(aliasesData).length)
					return message.reply(getLang("notExistAliasInGroup"));

				const result = Object.entries(aliasesData)
					.map(([cmd, als]) => `• ${cmd}: ${als.join(", ")}`)
					.join("\n");
				return message.reply(getLang("aliasListInGroup", result));
			}

			default:
				return message.SyntaxError();
		}
	}
};