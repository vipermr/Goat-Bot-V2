const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "shortcut",
    aliases: ["short"],
    version: "2.1",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    category: "custom",
    description: "Add reply shortcuts with message or attachments in group",
    guide: {
      en: `Add and manage shortcut replies:
• {pn} add hi => Hello!
• {pn} del hi
• {pn} list
• {pn} remove
• {pn} on/off`
    }
  },

  onStart: async function ({ args, message, event, threadsData, role }) {
    const { threadID, senderID } = event;
    const shortcutDir = path.join(__dirname, "shortcut_data");
    const filePath = path.join(shortcutDir, `${threadID}.json`);

    if (!fs.existsSync(shortcutDir)) fs.mkdirSync(shortcutDir);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({ enabled: true, shortcuts: [] }, null, 2));

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const { shortcuts, enabled } = data;

    const save = () => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const input = args.join(" ");
    const cmd = (args[0] || "").toLowerCase();

    if (["on", "off"].includes(cmd)) {
      data.enabled = cmd === "on";
      save();
      return message.reply(`Shortcut system is now ${cmd.toUpperCase()}`);
    }

    if (cmd === "add") {
      if (!input.includes("=>")) return message.reply("Invalid format. Use:\n!shortcut add hi => Hello");
      const [key, ...rest] = input.split("=>");
      const shortcutKey = key.replace("add", "").trim().toLowerCase();
      const shortcutMsg = rest.join("=>").trim();

      if (!shortcutKey) return message.reply("Shortcut keyword is missing.");
      if (!shortcutMsg && !event.attachments.length && !event.messageReply?.attachments?.length)
        return message.reply("Provide message content or attachments.");

      const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])];
      const existing = shortcuts.find(s => s.key === shortcutKey);

      const shortcut = {
        key: shortcutKey,
        text: shortcutMsg,
        attachments,
        author: senderID
      };

      if (existing) {
        if (existing.author !== senderID && role < 1) return message.reply("Only the author or admin can update this shortcut.");
        Object.assign(existing, shortcut);
        save();
        return message.reply(`Shortcut "${shortcutKey}" updated.`);
      }

      shortcuts.push(shortcut);
      save();
      return message.reply(`Shortcut "${shortcutKey}" added.`);
    }

    if (cmd === "del" || cmd === "delete") {
      const delKey = args.slice(1).join(" ").toLowerCase();
      const index = shortcuts.findIndex(x => x.key === delKey);
      if (index === -1) return message.reply(`Shortcut "${delKey}" not found.`);
      if (shortcuts[index].author !== senderID && role < 1)
        return message.reply("You don't have permission to delete this.");
      shortcuts.splice(index, 1);
      save();
      return message.reply(`Shortcut "${delKey}" deleted.`);
    }

    if (cmd === "remove") {
      if (role < 1) return message.reply("Only admins can remove all shortcuts.");
      data.shortcuts = [];
      save();
      return message.reply("All shortcuts removed.");
    }

    if (cmd === "list") {
      if (!shortcuts.length) return message.reply("No shortcuts set for this group.");
      const list = shortcuts.map(s => `• ${s.key}`).join("\n");
      return message.reply(`Shortcuts in this group:\n${list}`);
    }

    return message.reply("Invalid command. Use list, add, del, remove, on/off.");
  },

  onChat: async function ({ message, event }) {
    const { threadID, body } = event;
    const shortcutDir = path.join(__dirname, "shortcut_data");
    const filePath = path.join(shortcutDir, `${threadID}.json`);

    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (!data.enabled) return;

    const found = data.shortcuts.find(s => s.key === body.toLowerCase());
    if (!found) return;

    const msg = {
      body: found.text || null,
      attachment: []
    };

    if (found.attachments?.length) {
      const stream = require("axios");
      for (const att of found.attachments) {
        try {
          const res = await stream.get(att.url, { responseType: "stream" });
          msg.attachment.push(res.data);
        } catch (e) {
          console.error("Attachment fetch failed", e.message);
        }
      }
    }

    return message.reply(msg);
  }
};