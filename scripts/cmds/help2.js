const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help2",
    version: "2.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage"
    },
    longDescription: {
      en: "View command usage and details"
    },
    category: "info",
    guide: {
      en:
        "{pn} [empty | <page> | <command>]\n" +
        "{pn} <command> [-u | usage | -g | guide]: Show only usage\n" +
        "{pn} <command> [-i | info]: Show only info\n" +
        "{pn} <command> [-r | role]: Show only role required\n" +
        "{pn} <command> [-a | alias]: Show only aliases"
    },
    priority: 1
  },

  langs: {
    en: {
      help:
        "🔰 Command List:\n\n%1\n\nPage [ %2/%3 ] | Total commands: %4\nUse: %5help <page> or %5help <command>",
      help2:
        "%1\nCurrently, %2 commands available.\nUse: %3help <command> to view usage.\n%4",
      commandNotFound: "Command \"%1\" does not exist.",
      getInfoCommand:
        "🔹 Name: %1\n🔸 Description: %2\n🔹 Aliases: %3\n🔸 Group Aliases: %4\n🔹 Version: %5\n🔸 Role: %6\n🔹 Cooldown: %7s\n🔸 Author: %8\n\n📘 Usage:\n%9",
      onlyInfo:
        "📘 Info:\nCommand: %1\nDescription: %2\nAliases: %3\nGroup Aliases: %4\nVersion: %5\nRole: %6\nCooldown: %7s\nAuthor: %8",
      onlyUsage: "📘 Usage:\n%1",
      onlyAlias: "📘 Aliases:\nGlobal: %1\nGroup: %2",
      onlyRole: "📘 Role Required: %1",
      doNotHave: "None",
      roleText0: "0 (All users)",
      roleText1: "1 (Group admins)",
      roleText2: "2 (Bot admins)",
      roleText0setRole: "0 (set for all users)",
      roleText1setRole: "1 (set for group admins)",
      pageNotFound: "Page %1 does not exist."
    }
  },

  onStart: async function ({ message, args, event, threadsData, getLang, role }) {
    const langCode = "en";
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);
    let sortHelp = threadData.settings?.sortHelp || "name";
    if (!["category", "name"].includes(sortHelp)) sortHelp = "name";

    const commandName = (args[0] || "").toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));

    // LIST ALL COMMANDS
    if ((!command && !args[0]) || !isNaN(args[0])) {
      const arrayInfo = [];
      let msg = "";

      const page = parseInt(args[0]) || 1;
      const perPage = 20;
      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        let line = name;
        const shortDesc = value.config.shortDescription?.[langCode];
        if (shortDesc) line += `: ${shortDesc}`;
        arrayInfo.push({ data: line, priority: value.priority || 0 });
      }

      arrayInfo.sort((a, b) => a.data.localeCompare(b.data));
      arrayInfo.sort((a, b) => b.priority - a.priority);

      const { allPage, totalPage } = global.utils.splitPage(arrayInfo, perPage);
      if (page < 1 || page > totalPage) return message.reply(getLang("pageNotFound", page));

      const returnArray = allPage[page - 1] || [];
      const startNumber = (page - 1) * perPage + 1;
      msg += returnArray.map((item, i) => `${i + startNumber}. ${item.data}`).join("\n");

      return message.reply(getLang("help", msg, page, totalPage, commands.size, prefix));
    }

    // COMMAND NOT FOUND
    if (!command && args[0]) return message.reply(getLang("commandNotFound", args[0]));

    // COMMAND INFO
    const c = command.config;
    const guide = (typeof c.guide?.[langCode] === "string" ? c.guide[langCode] : c.guide?.[langCode]?.body || "") || "";
    const usage = guide
      .replace(/\{prefix\}|\{p\}/g, prefix)
      .replace(/\{name\}|\{n\}/g, c.name)
      .replace(/\{pn\}/g, prefix + c.name);

    const aliasesString = c.aliases?.join(", ") || getLang("doNotHave");
    const aliasesGroup = threadData.data?.aliases?.[c.name]?.join(", ") || getLang("doNotHave");

    let roleText = getLang(`roleText${c.role}`);
    if (threadData.data?.setRole?.[c.name]) {
      roleText = getLang(`roleText${c.role}setRole`);
    }

    const desc = c.longDescription?.[langCode] || getLang("doNotHave");
    const cooldown = c.countDown || 1;
    const author = c.author || "Unknown";

    const opt = args[1]?.toLowerCase();
    if (["-u", "usage", "-g", "guide"].includes(opt))
      return message.reply(getLang("onlyUsage", usage));
    if (["-a", "alias", "aliases"].includes(opt))
      return message.reply(getLang("onlyAlias", aliasesString, aliasesGroup));
    if (["-r", "role"].includes(opt))
      return message.reply(getLang("onlyRole", roleText));
    if (["-i", "info"].includes(opt))
      return message.reply(getLang("onlyInfo", c.name, desc, aliasesString, aliasesGroup, c.version, roleText, cooldown, author));

    return message.reply(getLang("getInfoCommand", c.name, desc, aliasesString, aliasesGroup, c.version, roleText, cooldown, author, usage));
  }
};