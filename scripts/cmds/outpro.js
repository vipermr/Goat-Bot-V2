const fs = require("fs");

module.exports = {
  config: {
    name: "outpro",
    version: "1.0",
    author: "NAFIJ x ChatGPT",
    role: 2,
    shortDescription: "Leave group",
    longDescription: "Let bot leave a group by reply or TID",
    category: "box",
    guide: "{pn} out list\n{pn} out <number(s)>\n{pn} out tid <TID>\nReply: out <number(s)>"
  },

  onStart: async function ({ api, event, args, threadsData }) {
    const { threadID, messageID } = event;

    const sendGuide = () => api.sendMessage(this.config.guide.replace(/{pn}/g, global.GoatBot.config.prefix), threadID, messageID);

    if (args[0] === "list") {
      const allThreads = await threadsData.getAll();
      const joined = allThreads.filter(t => t.threadName).map(t => ({
        name: t.threadName,
        id: t.threadID
      }));

      if (!joined.length) return api.sendMessage("❌ No joined groups found.", threadID, messageID);

      let msg = `📦 Joined groups (${joined.length}):\n`;
      joined.forEach((t, i) => msg += `${i + 1}. ${t.name} | 🆔 ${t.id}\n`);
      msg += "\nReply with: out <number(s)>";

      return api.sendMessage(msg, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          list: joined
        });
      });
    }

    if (args[0] === "tid") {
      const tid = args[1];
      if (!tid) return api.sendMessage("❌ Provide a Thread ID.", threadID, messageID);
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), tid);
        return api.sendMessage(`✅ Left the group (TID: ${tid}).`, threadID, messageID);
      } catch (e) {
        return api.sendMessage("❌ Failed to leave the group. Make sure I'm in that group.", threadID, messageID);
      }
    }

    return sendGuide();
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body } = event;
    const numbers = body.match(/\d+/g)?.map(n => parseInt(n)).filter(n => !isNaN(n)) || [];
    if (!numbers.length) return api.sendMessage("❌ Please reply with valid number(s).", threadID, messageID);

    const list = Reply.list;
    const toLeave = numbers.map(n => list[n - 1]).filter(Boolean);

    if (!toLeave.length) return api.sendMessage("❌ No valid group(s) found.", threadID, messageID);

    for (const group of toLeave) {
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), group.id);
      } catch (e) {
        api.sendMessage(`❌ Failed to leave ${group.name}`, threadID);
      }
    }

    global.GoatBot.onReply.delete(Reply.messageID);
    return api.sendMessage(`✅ Left ${toLeave.length} group(s).`, threadID, messageID);
  }
};