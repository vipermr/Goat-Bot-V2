module.exports = {
  config: {
    name: "tag",
    aliases: [],
    category: "𝗧𝗔𝗚",
    role: 0,
    author: "NAFIJ_PRO( MODED )",
    countDown: 3,
    description: { en: "Tag users by name or reply to tag someone directly." },
    guide: {
      en: `1. Reply to a message\n2. Use {pn}tag [name]\n3. Use {pn}tag [name] [optional message]\n4. Select numbers from result list (e.g., 1 2 4)`
    }
  },

  onStart: async ({ api, event, args, threadsData, usersData }) => {
    const { threadID, messageID, senderID, messageReply } = event;

    const threadData = await threadsData.get(threadID);
    const members = threadData.members.map(member => ({
      name: member.name,
      id: member.userID
    }));

    // If user replied to message
    if (messageReply) {
      const uid = messageReply.senderID;
      const name = await usersData.getName(uid);
      return api.sendMessage({
        body: `✨ Mentioning: ${name}`,
        mentions: [{ tag: name, id: uid }]
      }, threadID, messageID);
    }

    const nameInput = args[0];
    if (!nameInput || nameInput.length < 3)
      return api.sendMessage("❌ Please use at least 3 characters to search.", threadID, messageID);

    const keyword = nameInput.toLowerCase();
    const matched = members.filter(m => m.name.toLowerCase().includes(keyword));
    if (matched.length === 0)
      return api.sendMessage("❌ No matching names found.", threadID, messageID);

    if (matched.length === 1) {
      const name = matched[0].name;
      const id = matched[0].id;
      const extra = args.slice(1).join(" ");
      return api.sendMessage({
        body: `✨ ${name}${extra ? " - " + extra : ""}`,
        mentions: [{ tag: name, id }]
      }, threadID, messageID);
    }

    // Limit to 10 results for usability
    const topMatched = matched.slice(0, 10);
    const listText = topMatched.map((p, i) => `${i + 1}. ${p.name}`).join("\n");

    api.sendMessage(`✨ Found multiple matches:\n${listText}\n\nReply with number(s) (e.g., 1 or 2 4):`, threadID, async (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "tag",
        author: senderID,
        matched: topMatched,
        originalArgs: args.slice(1).join(" ")
      });
    });
  },

  onReply: async ({ api, event, Reply, messageID }) => {
    const { matched, author, originalArgs } = Reply;
    if (event.senderID !== author)
      return;

    const indexes = event.body.split(" ").map(i => parseInt(i) - 1).filter(i => matched[i]);
    if (indexes.length === 0)
      return api.sendMessage("❌ Invalid selection.", event.threadID, messageID);

    const selected = indexes.map(i => matched[i]);
    const mentions = selected.map(u => ({ tag: u.name, id: u.id }));
    const names = selected.map(u => u.name).join(", ");

    api.sendMessage({
      body: `✨ Mentioning: ${names}${originalArgs ? " - " + originalArgs : ""}`,
      mentions
    }, event.threadID, messageID);
  }
};