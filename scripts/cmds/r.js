module.exports = {
  config: {
    name: "r",
    version: "1.4",
    author: "♛ N A F I J ♛",
    role: 1,
    category: "pro",
    shortDescription: { en: "Remove user with confirmation" },
    longDescription: { en: "Find and remove a user after confirmation" },
    guide: { 
      en: "r <name> or reply to user and type r\n\nFor more info, visit my Facebook: https://www.facebook.com/nafijrahaman2023" 
    }
  },

  onStart: async function ({ event, api, args }) {
    const { threadID, messageID, senderID, messageReply } = event;
    const input = args.join(" ").toLowerCase().trim();
    const threadInfo = await api.getThreadInfo(threadID);

    const botAdmin = threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID());
    const userAdmin = threadInfo.adminIDs.some(e => e.id == senderID);

    if (!botAdmin) {
      return api.sendMessage("⚠️ | I need to be admin to remove someone.", threadID, messageID);
    }

    let targetUsers = [];

    if (messageReply) {
      targetUsers.push({ id: messageReply.senderID, name: messageReply.senderID });
    } else if (input.length > 0) {
      for (const user of threadInfo.userInfo) {
        if (user.name && user.name.toLowerCase().includes(input)) {
          targetUsers.push({ id: user.id, name: user.name });
        }
      }
    } else {
      return api.sendMessage("⚠️ | Please reply to a message or provide a name.", threadID, messageID);
    }

    if (targetUsers.length === 0) {
      return api.sendMessage("❌ | Target not found!", threadID, messageID);
    }

    await api.sendMessage("🔍 | Searching target...", threadID, async (err, info) => {
      setTimeout(() => {
        if (targetUsers.length === 1) {
          const user = targetUsers[0];
          api.sendMessage({
            body: `🎯 | Target Found:\n🔰 ${user.name}\n\nDo you want to remove?\n\nType 'yes', 'YES', 'y', or 'Y' to confirm removal, or 'no' to cancel.`,
            mentions: [{ tag: user.name, id: user.id }]
          }, threadID, (e, infoConfirm) => {
            global.GoatBot.onReply.set(infoConfirm.messageID, {
              commandName: "r",
              type: "confirm",
              targetID: user.id
            });
          });
        } else {
          let text = "🎯 | Multiple targets found:\n";
          for (let i = 0; i < targetUsers.length; i++) {
            text += `${i + 1}. ${targetUsers[i].name} (https://www.facebook.com/${targetUsers[i].id})\n`;
          }
          text += "\nReply with the number you want to remove.";
          api.sendMessage(text, threadID, (e, infoMulti) => {
            global.GoatBot.onReply.set(infoMulti.messageID, {
              commandName: "r",
              type: "select",
              list: targetUsers
            });
          });
        }
      }, 1000);
    });
  },

  onReply: async function ({ event, api, Reply }) {
    const { threadID, messageID, body, senderID } = event;
    const threadInfo = await api.getThreadInfo(threadID);

    const userAdmin = threadInfo.adminIDs.some(e => e.id == senderID);
    const botAdmin = threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID());

    if (!botAdmin) return api.sendMessage("⚠️ | I am not admin, can't remove.", threadID, messageID);
    if (!userAdmin) return api.sendMessage("⚠️ | Only admins can confirm removal.", threadID, messageID);

    if (Reply.type === "confirm") {
      const yesAnswers = ["yes", "Yes", "YES", "y", "Y"];
      if (yesAnswers.includes(body.trim())) {
        try {
          await api.removeUserFromGroup(Reply.targetID, threadID);
          api.sendMessage("✅ | User removed successfully.", threadID);
        } catch (e) {
          api.sendMessage("❌ | Failed to remove user.", threadID);
        }
      } else {
        api.sendMessage("❌ | Removal cancelled.", threadID);
      }
    }

    if (Reply.type === "select") {
      const index = parseInt(body) - 1;
      if (isNaN(index) || index < 0 || index >= Reply.list.length) {
        return api.sendMessage("⚠️ | Invalid number selected.", threadID, messageID);
      }
      const selected = Reply.list[index];
      api.sendMessage({
        body: `🎯 | Selected Target: ${selected.name}\n\nConfirm removal? (yes/no)`,
        mentions: [{ tag: selected.name, id: selected.id }]
      }, threadID, (e, infoConfirm) => {
        global.GoatBot.onReply.set(infoConfirm.messageID, {
          commandName: "r",
          type: "confirm",
          targetID: selected.id
        });
      });
    }
  }
};