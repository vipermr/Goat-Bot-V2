module.exports = {
  config: {
    name: "pen",
    version: "1.2",
    author: "NAFIJ_PRO_😾",
    countDown: 5,
    role: 3,
    shortDescription: {
      en: "Approve groups from pending list"
    },
    longDescription: {
      en: "Manually approve pending/spam group threads and set bot nickname."
    },
    category: "pro"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number.",
      cancelSuccess: "❌ Removed from %1 thread(s).",
      approveSuccess: "✅ Approved %1 thread(s) successfully!",
      cantGetPendingList: "Failed to fetch pending list!",
      returnListPending: "» [PENDING] Total threads to approve: %1 «\n\n%2",
      returnListClean: "✔ No threads in the pending list!"
    }
  },

  onReply: async function ({ api, event, Reply, getLang, commandName, prefix }) {
    if (String(event.senderID) !== String(Reply.author)) return;

    const { body, threadID, messageID } = event;
    let count = 0;

    // Cancel thread(s)
    if (isNaN(body) && (body.startsWith("c") || body.startsWith("cancel"))) {
      const indexList = body.slice(1).trim().split(/\s+/);
      for (const i of indexList) {
        const index = parseInt(i);
        if (isNaN(index) || index <= 0 || index > Reply.pending.length)
          return api.sendMessage(getLang("invaildNumber", i), threadID, messageID);

        await api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[index - 1].threadID);
        count++;
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    }

    // Approve thread(s)
    const indexList = body.trim().split(/\s+/);
    for (const i of indexList) {
      const index = parseInt(i);
      if (isNaN(index) || index <= 0 || index > Reply.pending.length)
        return api.sendMessage(getLang("invaildNumber", i), threadID, messageID);

      const groupID = Reply.pending[index - 1].threadID;

      // Send welcome message to group
      await api.sendMessage(
        `𝐀𝐒𝐒𝐀𝐋𝐀𝐌𝐔𝐀𝐋𝐀𝐈𝐊𝐔𝐌 ☔︎\n𝗧𝗵𝗶𝘀 group 𝗶𝘀 𝗮𝗽𝗽𝗿𝗼𝘃𝗲𝗱😼😾\n\n• Use ${prefix || "!"}help to see commands\n• Have a nice chat!`,
        groupID
      );

      // Set bot nickname
      const botID = api.getCurrentUserID();
      const nickNameBot = "😼 ANGRY SIZUKUA 😾";
      try {
        await api.changeNickname(nickNameBot, groupID, botID);
      } catch (e) {
        console.log("Failed to change bot nickname in group:", groupID);
      }

      count++;
    }

    return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

      if (list.length === 0)
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);

      for (const group of list)
        msg += `${index++}/ ${group.name} (${group.threadID})\n`;

      return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });
      }, messageID);
    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};
