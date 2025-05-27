const fs = require("fs");
const path = require("path");

const cachePath = path.join(__dirname, "cache");
const badwordsFile = path.join(cachePath, "badwordspro.json");
const warnsFile = path.join(cachePath, "warnspro.json");

if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
if (!fs.existsSync(badwordsFile)) fs.writeFileSync(badwordsFile, JSON.stringify({ words: [], on: true }, null, 2));
if (!fs.existsSync(warnsFile)) fs.writeFileSync(warnsFile, JSON.stringify({}, null, 2));

const allowedAdmins = ["100058371606434", "100058371606435", "100058371606436"];

module.exports = {
  config: {
    name: "bwpro",
    aliases: ["badwordpro", "badwordspro"],
    version: "2.2",
    author: "NAFIJ PRO",
    countDown: 3,
    role: 0,
    shortDescription: "Global badword filter with auto-warn/kick (v2)",
    longDescription: "Super admins can add/remove badwords globally. Auto-warns and kicks on repeat violations.",
    category: "box chat",
    guide: {
      en: "bw2 add <word>\nbw2 del <word>\nbw2 list\nbw2 on/off\nbw2 unwarn @user"
    }
  },

  async onStart({ message, event, args }) {
    const { senderID, mentions = {}, messageReply } = event;
    const isOwner = allowedAdmins.includes(senderID);
    if (!isOwner)
      return message.reply("Only NAFIJ PRO super admins can manage badwords.");

    const cmd = args[0]?.toLowerCase();
    const badwordsData = JSON.parse(fs.readFileSync(badwordsFile));

    if (cmd === "add") {
      let text = args.slice(1).join(" ") || messageReply?.body;
      if (!text) return message.reply("Reply or type a word to add.");
      const words = text.toLowerCase().split(/[,|]/).map(w => w.trim());
      const newWords = words.filter(w => !badwordsData.words.includes(w));
      badwordsData.words.push(...newWords);
      fs.writeFileSync(badwordsFile, JSON.stringify(badwordsData, null, 2));
      return message.reply(`✅ Added badwords: ${newWords.join(", ")}`);
    }

    if (cmd === "del") {
      let text = args.slice(1).join(" ") || messageReply?.body;
      if (!text) return message.reply("Reply or type a word to delete.");
      const words = text.toLowerCase().split(/[,|]/).map(w => w.trim());
      badwordsData.words = badwordsData.words.filter(w => !words.includes(w));
      fs.writeFileSync(badwordsFile, JSON.stringify(badwordsData, null, 2));
      return message.reply(`❌ Removed badwords: ${words.join(", ")}`);
    }

    if (cmd === "list") {
      const list = badwordsData.words.join(", ");
      return message.reply(list ? `📃 Badwords:\n${list}` : "No badwords found.");
    }

    if (cmd === "on" || cmd === "off") {
      badwordsData.on = cmd === "on";
      fs.writeFileSync(badwordsFile, JSON.stringify(badwordsData, null, 2));
      return message.reply(`Badword filter turned ${cmd.toUpperCase()}`);
    }

    if (cmd === "unwarn") {
      const warnsData = JSON.parse(fs.readFileSync(warnsFile));
      const targetID = Object.keys(mentions)[0] || messageReply?.senderID;
      if (!targetID) return message.reply("Tag or reply to someone to unwarn.");
      if (!warnsData[targetID])
        return message.reply("That user has no warnings.");
      delete warnsData[targetID];
      fs.writeFileSync(warnsFile, JSON.stringify(warnsData, null, 2));
      return message.reply("✅ User warnings reset.");
    }

    return message.reply("Invalid command. Use add/del/list/on/off/unwarn");
  },

  async onChat({ event, message, usersData, threadsData, api }) {
    const { threadID, senderID, body } = event;
    if (!body) return;

    const badwordsData = JSON.parse(fs.readFileSync(badwordsFile));
    if (!badwordsData.on || !badwordsData.words.length) return;

    const loweredBody = body.toLowerCase();
    const matched = badwordsData.words.find(w => loweredBody.includes(w));
    if (!matched) return;

    const warnsData = JSON.parse(fs.readFileSync(warnsFile));
    warnsData[senderID] = (warnsData[senderID] || 0) + 1;
    fs.writeFileSync(warnsFile, JSON.stringify(warnsData, null, 2));

    const username = await usersData.getName(senderID);
    const threadInfo = await threadsData.get(threadID);
    const adminIDs = threadInfo.adminIDs?.map(e => e.id) || [];

    if (warnsData[senderID] === 1) {
      return message.reply(`⚠️ ${username}, warning 1/2 for badword: "${matched}"`);
    }

    delete warnsData[senderID];
    fs.writeFileSync(warnsFile, JSON.stringify(warnsData, null, 2));

    const botID = api.getCurrentUserID();
    const botIsGroupAdmin = adminIDs.includes(botID);

    if (!botIsGroupAdmin) {
      const mentions = adminIDs.map(id => ({ id, tag: "Admin" }));
      return message.reply({
        body: `⚠️ ${username} used badwords repeatedly.\nAdmins, take action manually.`,
        mentions
      });
    }

    try {
      await message.reply(`❌ ${username} has been removed for using badwords repeatedly.`);
      await api.removeUserFromGroup(senderID, threadID);
    } catch (err) {
      console.error("Kick user error:", err);
      await message.reply(`❌ Failed to kick ${username}. Check bot permissions.`);
    }
  }
};