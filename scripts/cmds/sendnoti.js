const fs = require("fs-extra");
const path = __dirname + "/data/sendnoti";
const dataFile = path + "/groups.json";
const allowedAdmins = ["100058371606434", "100076392488331"];

module.exports = {
  config: {
    name: "sendnoti",
    aliases: [],
    version: "3.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    shortDescription: "Send a notification to saved groups",
    longDescription: "Send messages to groups saved under specific names",
    category: "group",
    guide: "{pn} add (name) | remove (name) | list | send (name) <msg> | usage"
  },

  onStart: async function ({ args, threadsData, message, event, api }) {
    // Ensure folder and file exist
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({}));

    let data = JSON.parse(fs.readFileSync(dataFile));
    const action = args[0];
    const name = args[1]?.toLowerCase();
    const msg = args.slice(2).join(" ") || (event.messageReply?.body || "");
    const threadID = event.threadID;
    const senderID = String(event.senderID);

    // Validate admin for protected commands
    const isAdmin = allowedAdmins.includes(senderID);

    switch (action) {
      case "add":
        if (!isAdmin) return message.reply("❌ Only authorized admins can add groups.");
        if (!name) return message.reply("⚠️ Usage: {pn} add (name)");
        data[name] = data[name] || [];
        if (!data[name].includes(threadID)) {
          data[name].push(threadID);
          fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
          return message.reply(`✅ This group was added to list "${name}"`);
        } else return message.reply("⚠️ This group is already in that list.");
      
      case "remove":
        if (!isAdmin) return message.reply("❌ Only authorized admins can remove groups.");
        if (!name || !data[name]) return message.reply("⚠️ Usage: {pn} remove (name)");
        data[name] = data[name].filter(id => id !== threadID);
        if (data[name].length === 0) delete data[name];
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return message.reply(`🗑️ Group removed from "${name}" list.`);
      
      case "list":
        if (Object.keys(data).length === 0) return message.reply("📭 No group lists found.");
        let replyMsg = "📋 Saved Notification Lists:\n\n";
        for (let key in data) replyMsg += `• ${key} (${data[key].length} group${data[key].length > 1 ? "s" : ""})\n`;
        return message.reply(replyMsg.trim());

      case "send":
        if (!isAdmin) return message.reply("❌ Only authorized admins can send messages.");
        if (!name || !data[name]) return message.reply("⚠️ Invalid list name. Use `{pn} list` to check.");
        if (!msg) return message.reply("⚠️ Please provide a message or reply to one.");
        let success = 0, failed = 0;
        for (let gid of data[name]) {
          try {
            await api.sendMessage(msg, gid);
            success++;
          } catch {
            failed++;
          }
        }
        return message.reply(`✅ Sent to ${success} group(s)\n❌ Failed on ${failed} group(s)`);

      case "usage":
        return message.reply(
          `🛠️ Usage Guide for SendNoti:\n\n` +
          `• {pn} add (name) ➤ Save current group to list\n` +
          `• {pn} remove (name) ➤ Remove group from list\n` +
          `• {pn} list ➤ Show all saved lists\n` +
          `• {pn} send (name) <message> ➤ Send to all groups in list\n` +
          `• {pn} send (name) <reply> ➤ Reply to a message to send it\n`
        );

      default:
        return message.reply("❓ Unknown command. Use `{pn} usage` for help.");
    }
  }
};