module.exports = {
	config: {
		name: "react",
		version: "1.0",
		author: "Mesbah Saxx",
		countDown: 5,
		role: 0,
		description: {
			en: "Manage reaction-based commands.",
		},
		category: "handler",
		guide: {
			en: "     {pn} add <reaction> <command>"
			  + "\n     {pn} delete <reaction|command>"
			  + "\n     {pn} edit <reaction|command> <new value>"
			  + "\n     {pn} list",
		}
	},

	onStart: async function ({ args, globalData, message, event, prefix, commandName }) {
		const subCommand = args[0]?.toLowerCase();
		const global_data = await globalData.get("onReactionCommand", "data", []);

		async function saveData(updatedData) {
			await globalData.set("onReactionCommand", updatedData, "data");
		}

		switch (subCommand) {
			case "list": {
				if (global_data.length === 0) return message.reply("No reaction commands have been set.");
				
				let response = "📌 Reaction Commands:\n";
				global_data.forEach(({ reaction, commandName }) => {
					response += `🔹 Reaction: ${reaction}\n→ Command: ${commandName}\n`;
				});
				return message.reply(response);
			}

			case "add": {
				const reaction = args[1];
				const commandName = args[2];

				if (!reaction || !commandName) {
					return message.reply(`Usage: ${prefix}${commandName} add <reaction> <command>`);
				}

				if (global_data.some(item => item.reaction === reaction || item.commandName === commandName)) {
					return message.reply(`Either the reaction "${reaction}" or command "${commandName}" is already assigned.`);
				}

				global_data.push({ reaction, commandName });
				await saveData(global_data);
				return message.reply(`✅ Reaction "${reaction}" now triggers the command "${commandName}".`);
			}

			case "delete": {
				const target = args[1];

				if (!target) {
					return message.reply(`Usage: ${prefix}${commandName} delete <reaction | command>`);
				}

				const updatedData = global_data.filter(item => item.reaction !== target && item.commandName !== target);

				if (updatedData.length === global_data.length) {
					return message.reply(`No matching reaction or command found for "${target}".`);
				}

				await saveData(updatedData);
				return message.reply(`🗑️ Removed reaction or command associated with "${target}".`);
			}

			case "edit": {
				const oldValue = args[1];
				const newValue = args[2];

				if (!oldValue || !newValue) {
					return message.reply(`Usage:\n${prefix}${commandName} edit <reaction> <newCommand>\n${prefix}${commandName} edit <command> <newReaction>`);
				}

				let edited = false;

				global_data.forEach(item => {
					if (item.reaction === oldValue) {
						item.commandName = newValue;
						edited = true;
					} else if (item.commandName === oldValue) {
						item.reaction = newValue;
						edited = true;
					}
				});

				if (!edited) {
					return message.reply(`No matching reaction or command found for "${oldValue}".`);
				}

				await saveData(global_data);
				return message.reply(`✏️ Updated "${oldValue}" to "${newValue}".`);
			}

			default:
				return message.SyntaxError();
		}
	}
};
