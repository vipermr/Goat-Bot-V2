const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "rules",
    version: "2.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    description: "Create/view/edit/delete group rules",
    category: "box chat",
    guide: {
      en:
        "{pn} [add|-a] <rule>: Add a rule\n" +
        "{pn}: View all rules\n" +
        "{pn} [edit|-e] <n> <new content>: Edit rule n\n" +
        "{pn} [move|-m] <n1> <n2>: Swap rule n1 and n2\n" +
        "{pn} [delete|-d] <n>: Delete rule n\n" +
        "{pn} [remove|-r]: Delete all rules\n" +
        "{pn} <n>: View rule number n\n" +
        "{pn}usage: Show usage instructions"
    }
  },

  langs: {
    en: {
      yourRules: "Group rules:\n%1",
      noRules: "No rules found. Use `{pn}add <rule>` to create one.",
      noPermissionAdd: "Only group admins can add rules.",
      noContent: "Please provide rule content.",
      success: "Rule added successfully.",
      noPermissionEdit: "Only group admins can edit rules.",
      invalidNumber: "Invalid rule number.",
      rulesNotExist: "Rule %1 doesn't exist.",
      numberRules: "There are %1 rules in this group.",
      noContentEdit: "Please provide new content for rule %1.",
      successEdit: "Updated rule %1 to: %2",
      noPermissionMove: "Only group admins can move rules.",
      invalidNumberMove: "Please provide two valid rule numbers to swap.",
      sameNumberMove: "Cannot swap the same rule number.",
      rulesNotExistMove2: "Rules %1 and %2 do not exist.",
      successMove: "Swapped rule %1 and %2 successfully.",
      noPermissionDelete: "Only group admins can delete rules.",
      invalidNumberDelete: "Please provide a valid rule number to delete.",
      rulesNotExistDelete: "Rule %1 does not exist.",
      successDelete: "Deleted rule %1: %2",
      noPermissionRemove: "Only group admins can delete all rules.",
      confirmRemove: "⚠ React to confirm deletion of all rules.",
      successRemove: "All rules deleted.",
      invalidNumberView: "Invalid rule number.",
      usage:
        "Rules Command Usage:\n" +
        "- {pn} [add|-a] <rule>: Add a rule\n" +
        "- {pn}: View all rules\n" +
        "- {pn} [edit|-e] <n> <new content>: Edit rule n\n" +
        "- {pn} [move|-m] <n1> <n2>: Swap rule n1 and n2\n" +
        "- {pn} [delete|-d] <n>: Delete rule n\n" +
        "- {pn} [remove|-r]: Delete all rules\n" +
        "- {pn} <n>: View rule number n"
    }
  },

  onStart: async function ({ role, args, message, event, threadsData, getLang, commandName }) {
    const { threadID, senderID } = event;
    const type = args[0];
    const rules = await threadsData.get(threadID, "data.rules", []);
    const total = rules.length;

    if (type === "usage") {
      return message.reply(getLang("usage"));
    }

    if (!type) {
      let i = 1;
      const list = rules.map(rule => `${i++}. ${rule}`).join("\n");
      return message.reply(list ? getLang("yourRules", list) : getLang("noRules", getPrefix(threadID)));
    }

    if (["add", "-a"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermissionAdd"));
      const content = args.slice(1).join(" ");
      if (!content) return message.reply(getLang("noContent"));
      rules.push(content);
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(getLang("success"));
    }

    if (["edit", "-e"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermissionEdit"));
      const index = parseInt(args[1]);
      if (isNaN(index)) return message.reply(getLang("invalidNumber"));
      if (!rules[index - 1]) return message.reply(getLang("rulesNotExist", index));
      const newContent = args.slice(2).join(" ");
      if (!newContent) return message.reply(getLang("noContentEdit", index));
      rules[index - 1] = newContent;
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(getLang("successEdit", index, newContent));
    }

    if (["move", "-m"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermissionMove"));
      const n1 = parseInt(args[1]), n2 = parseInt(args[2]);
      if (isNaN(n1) || isNaN(n2)) return message.reply(getLang("invalidNumberMove"));
      if (n1 === n2) return message.reply(getLang("sameNumberMove"));
      if (!rules[n1 - 1] || !rules[n2 - 1]) return message.reply(getLang("rulesNotExistMove2", n1, n2));
      [rules[n1 - 1], rules[n2 - 1]] = [rules[n2 - 1], rules[n1 - 1]];
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(getLang("successMove", n1, n2));
    }

    if (["delete", "del", "-d"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermissionDelete"));
      const index = parseInt(args[1]);
      if (isNaN(index)) return message.reply(getLang("invalidNumberDelete"));
      const removed = rules[index - 1];
      if (!removed) return message.reply(getLang("rulesNotExistDelete", index));
      rules.splice(index - 1, 1);
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(getLang("successDelete", index, removed));
    }

    if (["remove", "reset", "-r", "-rm"].includes(type)) {
      if (role < 1) return message.reply(getLang("noPermissionRemove"));
      return message.reply(getLang("confirmRemove"), (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          commandName: "rules",
          messageID: info.messageID,
          author: senderID
        });
      });
    }

    if (!isNaN(type)) {
      let output = "";
      for (const n of args) {
        const r = rules[parseInt(n) - 1];
        if (r) output += `${n}. ${r}\n`;
      }
      if (!output) return message.reply(getLang("rulesNotExist", type));
      return message.reply(output);
    }

    return message.SyntaxError();
  },

  onReply: async function ({ message, event, getLang, Reply }) {
    if (Reply.author !== event.senderID) return;
    const n = parseInt(event.body);
    if (isNaN(n) || n < 1) return message.reply(getLang("invalidNumberView"));
    const rule = Reply.rulesOfThread[n - 1];
    if (!rule) return message.reply(getLang("rulesNotExist", n));
    message.reply(`${n}. ${rule}`, () => message.unsend(Reply.messageID));
  },

  onReaction: async ({ threadsData, message, Reaction, event, getLang }) => {
    if (Reaction.author !== event.userID) return;
    await threadsData.set(event.threadID, [], "data.rules");
    message.reply(getLang("successRemove"));
  }
};