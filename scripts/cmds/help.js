const { GoatWrapper } = require("fca-liane-utils");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.19",
    author: "NAFIJ_PRO( MODED )",
    usePrefix: false,
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "📘 View command usage and list all commands"
    },
    longDescription: {
      en: "📘 View detailed usage of a command or list all commands"
    },
    category: "pro",
    guide: {
      en: "{pn} or {pn} <commandName>"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const threadData = await threadsData.get(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "╭───✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦 ✨───╮\n";

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      for (const category in categories) {
        const cmds = categories[category].sort();
        msg += `\n🌟 ${category.toUpperCase()} 🌟\n`;
        for (let i = 0; i < cmds.length; i += 3) {
          msg += `  ${cmds.slice(i, i + 3).map(cmd => `🔹 ${cmd}`).join("   ")}\n`;
        }
      }

      const totalCommands = commands.size;
      msg += `\n╰────────────────────────────╯
╭───────📊 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 📊───────╮
📌 Total Commands: ${totalCommands}
❓ Usage: ${prefix}help <command>
👤 Developer: NAFIJ_PRO_✅
🌐 Facebook: fb.com/nafijrahaman2023
╰────────────────────────────╯`;

      return message.reply(msg);
    }

    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command) return message.reply(`❌ Command "${commandName}" not found.`);

    const config = command.config;
    const roleStr = roleToStr(config.role);
    const aliasesStr = config.aliases?.join(", ") || "❌ None";
    const guide = config.guide?.en?.replace(/{p}/g, prefix).replace(/{n}/g, config.name) || "❌ No guide available.";
    const desc = config.longDescription?.en || "❌ No description.";
    const version = config.version || "1.0";
    const cooldown = config.countDown || 1;
    const author = config.author || "Unknown";

    const response = `╭──✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ✨──╮

🔹 Name: ${config.name}
📝 Description: ${desc}
📚 Aliases: ${aliasesStr}
⚙️ Version: ${version}
⏱️ Cooldown: ${cooldown}s
🔐 Role: ${roleStr}
👤 Author: ${author}

╭──💡 𝗨𝗦𝗔𝗚𝗘 💡──╮
📘 ${guide}

╭──🧾 𝗡𝗢𝗧𝗘𝗦 🧾──╮
⚠️ Replace <NAFIJ> with your input
🔁 Use [a|b|c] for choices

╰────────────────╯`;

    return message.reply(response);
  }
};

function roleToStr(role) {
  switch (role) {
    case 0: return "0 (👥 Everyone)";
    case 1: return "1 (👮 Group Admin)";
    case 2: return "2 (👑 Bot Admin)";
    default: return "❓ Unknown";
  }
}

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });