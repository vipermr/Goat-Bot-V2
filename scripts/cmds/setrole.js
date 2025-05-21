module.exports = {
  config: {
    name: "setrole",
    version: "2.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 1,
    description: "Edit role permission of commands (for commands with role < 2)",
    category: "info",
    guide: {
      en: `Usage:
{pn} <commandName> <new role> - Change command permission
{pn} <commandName> default - Reset command permission
{pn} view - Show commands with custom roles

Roles:
0 - All members can use
1 - Admins only
default - Reset to original config

Examples:
{pn} rank 1      -> Only admins can use 'rank'
{pn} rank 0      -> All members can use 'rank'
{pn} rank default -> Reset 'rank' to default permission
{pn} view        -> Show all commands with edited roles`
    }
  },

  langs: {
    en: {
      noEditedCommand: "✅ No command roles have been edited in this group.",
      editedCommand: "⚠️ Edited command roles in this group:\n",
      noPermission: "❗ Only group admins can use this command.",
      commandNotFound: "❌ Command \"%1\" not found.",
      noChangeRole: "❗ Cannot change role of command \"%1\".",
      resetRole: "✅ Reset role of command \"%1\" to default.",
      changedRole: "✅ Changed role of command \"%1\" to %2."
    }
  },

  onStart: async function ({ message, event, args, role, threadsData, getLang }) {
    const { commands, aliases } = global.GoatBot;
    const { threadID } = event;
    const setRole = await threadsData.get(threadID, "data.setRole", {});

    // Show list of edited roles
    if (["view", "viewrole", "show"].includes(args[0])) {
      if (!setRole || Object.keys(setRole).length === 0)
        return message.reply(getLang("noEditedCommand"));
      let msg = getLang("editedCommand");
      for (const cmd in setRole) msg += `- ${cmd} => ${setRole[cmd]}\n`;
      return message.reply(msg);
    }

    const commandNameInput = (args[0] || "").toLowerCase();
    let newRole = args[1];
    if (!commandNameInput || (isNaN(newRole) && newRole !== "default"))
      return message.SyntaxError();

    if (role < 1)
      return message.reply(getLang("noPermission"));

    // Resolve command from name or alias
    const command = commands.get(commandNameInput) || commands.get(aliases.get(commandNameInput));
    if (!command)
      return message.reply(getLang("commandNotFound", commandNameInput));

    const commandName = command.config.name;

    // Cannot override protected commands
    if (command.config.role > 1)
      return message.reply(getLang("noChangeRole", commandName));

    const isDefault = newRole === "default" || Number(newRole) === command.config.role;
    if (isDefault) {
      delete setRole[commandName];
      await threadsData.set(threadID, setRole, "data.setRole");
      return message.reply(getLang("resetRole", commandName));
    }

    newRole = parseInt(newRole);
    setRole[commandName] = newRole;
    await threadsData.set(threadID, setRole, "data.setRole");
    return message.reply(getLang("changedRole", commandName, newRole));
  }
};