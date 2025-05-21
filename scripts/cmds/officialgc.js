module.exports = {
  config: {
    name: "supportgc",
    version: "1.2",
    author: "Shikaki",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Join the support group chat"
    },
    longDescription: {
      en: "Join the official support group to get help and stay connected"
    },
    category: "General",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, threadsData, message }) {
    const supportGroupThreadID = "28297135763266706"; // Replace with your support group thread ID
    const botID = api.getCurrentUserID();

    try {
      const { members } = await threadsData.get(supportGroupThreadID);

      const senderName = event.senderName || (await api.getUserInfo(event.senderID))[event.senderID].name;
      const userAlreadyInGroup = members.some(
        member => member.userID === event.senderID && member.inGroup
      );

      if (userAlreadyInGroup) {
        return message.reply(
          `🚫 Hello ${senderName}, you are already a member of the support group.\n\n` +
          `There's no need to join again. See you there!`
        );
      }

      await api.addUserToGroup(event.senderID, supportGroupThreadID);

      return message.reply(
        `✅ Hi ${senderName}! You’ve been successfully added to the support group.\n\n` +
        `Feel free to ask questions, get help, or just hang out with the community.`
      );
    } catch (error) {
      const senderName = event.senderName || (await api.getUserInfo(event.senderID))[event.senderID].name;
      console.error("Error adding user to support group:", error);

      return message.reply(
        `❌ Oops! I couldn't add you to the support group.\n\n` +
        `Please make sure your profile is unlocked and you’ve sent a friend request to the bot, then try again.\n\n` +
        `Let’s try this again soon, ${senderName}.`
      );
    }
  }
};