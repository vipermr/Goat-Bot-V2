const fs = require("fs-extra");
const ignoreList = global.GoatBot.config.adminOnly.ignoreCommand;

module.exports = {
  config: {
    name: "ignoreonlyad",
    aliases: ["ignoreadonly", "ignoreonlyadmin", "ignoreadminonly"],
    version: "1.3",
    author: "NTKhang (Modified by NAFIJ_PRO)",
    countDown: 5,
    role: 2,
    shortDescription: "Ignore specific command in admin-only mode",
    longDescription: "Allows certain commands to be used even when adminOnly mode is enabled",
    category: "owner",
    guide: {
      en: "{pn} add <commandName>\n{pn} del <commandName>\n{pn} list\n(You can also reply to a message with the command name)"
    }
  },

  langs: {
    en: {
      missingCommandNameToAdd: "⚠️ Please enter or reply with the command name to add to the ignore list.",
      missingCommandNameToDelete: "⚠️ Please enter or reply with the command name to remove from the ignore list.",
      commandNotFound: "❌ Command \"%1\" not found in the bot's command list.",
      commandAlreadyInList: "❌ Command \"%1\" is already in the ignore list.",
      commandAdded: "✅ Successfully added \"%1\" to the ignore list.",
      commandNotInList: "❌ Command \"%1\" is not in the ignore list.",
      commandDeleted: "✅ Successfully removed \"%1\" from the ignore list.",
      ignoreList: "📑 Commands ignored in adminOnly mode:\n%1"
    }
  },

  onStart: async function ({ args, message, event, getLang }) {
    const input = args[1] || (event.messageReply?.body?.trim().split(" ")[0]?.toLowerCase());

    switch (args[0]) {
      case "add": {
        if (!input) return message.reply(getLang("missingCommandNameToAdd"));

        const command = global.GoatBot.commands.get(input);
        if (!command) return message.reply(getLang("commandNotFound", input));
        if (ignoreList.includes(input)) return message.reply(getLang("commandAlreadyInList", input));

        ignoreList.push(input);
        fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
        return message.reply(getLang("commandAdded", input));
      }

      case "del":
      case "delete":
      case "remove":
      case "rm":
      case "-d": {
        if (!input) return message.reply(getLang("missingCommandNameToDelete"));

        const command = global.GoatBot.commands.get(input);
        if (!command) return message.reply(getLang("commandNotFound", input));
        if (!ignoreList.includes(input)) return message.reply(getLang("commandNotInList", input));

        ignoreList.splice(ignoreList.indexOf(input), 1);
        fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
        return message.reply(getLang("commandDeleted", input));
      }

      case "list": {
        const formattedList = ignoreList.length ? ignoreList.join(", ") : "No commands in the ignore list.";
        return message.reply(getLang("ignoreList", formattedList));
      }

      default: {
        return message.reply(`❌ Invalid usage.\nUsage:\n${this.config.guide.en.replace(/{pn}/g, "/" + this.config.name)}`);
      }
    }
  }
};