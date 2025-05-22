const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const badwordFile = path.join(dataDir, "badwordspro.json");

// Ensure data folder and file exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(badwordFile)) {
  fs.writeFileSync(badwordFile, JSON.stringify({ words: [], on: true }, null, 2));
}

module.exports = {
  config: {
    name: "bw2",
    aliases: [],
    version: "1.0",
    author: "NAFIJ PRO",
    role: 0,
    shortDescription: "Add badword + auto kick",
    longDescription: "Adds global badword & auto removes user if matched",
    category: "box chat",
    guide: {
      en: "bw3 add <word>"
    }
  },

  async onStart({ message, event, args }) {
    const { messageReply } = event;
    const cmd = args[0]?.toLowerCase();

    if (cmd === "add") {
      let text = args.slice(1).join(" ") || messageReply?.body;
      if (!text) return message.reply("Reply or type a word to add.");

      const data = JSON.parse(fs.readFileSync(badwordFile));
      const words = text.toLowerCase().split(/[,|]/).map(w => w.trim());
      const newWords = words.filter(w => !data.words.includes(w));
      data.words.push(...newWords);
      fs.writeFileSync(badwordFile, JSON.stringify(data, null, 2));

      return message.reply(`✅ Added badwords: ${newWords.join(", ")}`);
    }

    return message.reply("Use: bw3 add <word>");
  },

  async onChat({ event, message, threadsData, usersData, api }) {
    const { threadID, senderID, body } = event;
    if (!body) return;

    const data = JSON.parse(fs.readFileSync(badwordFile));
    if (!data.on || !data.words.length) return;

    const matched = data.words.find(w => body.toLowerCase().includes(w));
    if (!matched) return;

    const username = await usersData.getName(senderID);
    const threadInfo = await threadsData.get(threadID);
    const adminIDs = threadInfo.adminIDs?.map(e => e.id) || [];
    const botID = api.getCurrentUserID();

    if (adminIDs.includes(botID)) {
      try {
        await message.reply(`❌ ${username} used badword: "${matched}" and was removed.`);
        await api.removeUserFromGroup(senderID, threadID);
      } catch (err) {
        return message.reply(`⚠️ Failed to remove ${username}. Check permissions.`);
      }
    } else {
      return message.reply(`⚠️ ${username} used badword: "${matched}"\nBut I can't remove them. I'm not admin.`);
    }
  }
};