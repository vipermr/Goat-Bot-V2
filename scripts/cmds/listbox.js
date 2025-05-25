module.exports = {
  config: {
    name: "listboxpro",
    version: "2.5",
    author: "NAFIJ + Modified",
    role: 0,
    shortDescription: "List groups with add/out and auto-add NAFIJ_PRO_✅",
    longDescription: "List groups; reply with 'add' or 'out' to add NAFIJ_PRO_✅ or leave groups",
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function({ api, event }) {
    const senderID = event.senderID;
    const allowUID = ["100058371606434"]; // Only this UID allowed to run

    if (!allowUID.includes(senderID)) return;

    const allThreads = await api.getThreadList(100, null, ["INBOX"]);
    const groups = allThreads.filter(t => t.isGroup && t.threadName);

    if (groups.length === 0)
      return api.sendMessage("No group chats found.", event.threadID, event.messageID);

    let msg = "╭──── Group List ────╮\n";
    groups.forEach((g, i) => {
      msg += `│ ${i + 1}. ${g.threadName}\n│ TID: ${g.threadID}\n`;
    });
    msg +=
      "╰────────────────────╯\n\n⏳ Reply with:\n- out 1 3 to leave groups\n- add 2 5 to add NAFIJ_PRO_✅";

    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "listbox10",
        messageID: info.messageID,
        author: senderID,
        groups
      });
    });
  },

  onReply: async function({ api, event, Reply, message }) {
    const { author, groups } = Reply;
    if (event.senderID !== author) return;

    const args = event.body.trim().split(/\s+/);
    const action = args.shift().toLowerCase();
    const indexes = args
      .map(i => parseInt(i))
      .filter(n => !isNaN(n) && n >= 1 && n <= groups.length);

    if (indexes.length === 0)
      return api.sendMessage(
        "❌ Invalid index numbers.",
        event.threadID,
        event.messageID
      );

    if (action === "out") {
      for (const i of indexes) {
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), groups[i - 1].threadID);
          await api.sendMessage(`✅ Left group: ${groups[i - 1].threadName}`, event.threadID);
        } catch (e) {
          await api.sendMessage(`❌ Can't leave group ${groups[i - 1].threadName}: ${e.message}`, event.threadID);
        }
      }
    } else if (action === "add") {
      for (const i of indexes) {
        try {
          const listaddCmd = global.GoatBot.commands.get("listadd");
          if (!listaddCmd) {
            return api.sendMessage("❌ listadd command not found.", event.threadID);
          }

          await listaddCmd.onStart({
            api,
            event: {
              threadID: groups[i - 1].threadID,
              senderID: event.senderID
            },
            message,
            getLang: (key) => key
          });

          await api.sendMessage(`✅ Added NAFIJ_PRO_✅ in group: ${groups[i - 1].threadName}`, event.threadID);
        } catch (e) {
          await api.sendMessage(`❌ Failed to add NAFIJ_PRO_✅ in group ${groups[i - 1].threadName}: ${e.message}`, event.threadID);
        }
      }
    } else {
      return api.sendMessage(
        "❌ Use only 'add' or 'out' commands.",
        event.threadID,
        event.messageID
      );
    }
  }
};