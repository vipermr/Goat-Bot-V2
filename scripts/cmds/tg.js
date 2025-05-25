module.exports = {

  config: {

    name: "tg",

    version: "1.0",

    author: "♛ N A F I J ♛",

    role: 0,

    category: "pro",

    shortDescription: { en: "Tag by name" },

    longDescription: { en: "Search and tag user by their name" },

    guide: { en: "tg <name>" }

  },


  onStart: async function ({ event, api, args }) {

    const { threadID, messageID, senderID } = event;

    const input = args.join(" ").toLowerCase().trim();

    const threadInfo = await api.getThreadInfo(threadID);


    let targetUsers = [];


    if (input.length > 0) {

      for (const user of threadInfo.userInfo) {

        if (user.name && user.name.toLowerCase().includes(input)) {

          targetUsers.push({ id: user.id, name: user.name });

        }

      }

    } else {

      return api.sendMessage("নাম কি তোর নানা দিবে ?", threadID, messageID);

    }


    if (targetUsers.length > 5) {

      return api.sendMessage("⚠️ ভালকরে নাম লিখ বলদ😕.", threadID, messageID);

    }


    if (targetUsers.length === 0) {

      return api.sendMessage("❌  targets not found.", threadID, messageID);

    }


    let text = `🎯 ${targetUsers.length} targe found:\n`;

    targetUsers.forEach((user, index) => {

      text += `${index + 1}. ${user.name}\n`;

    });


    api.sendMessage(text, threadID, (e, info) => {

      global.GoatBot.onReply.set(info.messageID, {

        commandName: "tg",

        type: "tag",

        targetUsers: targetUsers

      });

    });

  },


  onReply: async function ({ event, api, Reply }) {

    const { threadID, messageID, body, senderID } = event;

    const targetUsers = Reply.targetUsers;


    if (body && !isNaN(body)) {

      const index = parseInt(body) - 1;

      if (index >= 0 && index < targetUsers.length) {

        const user = targetUsers[index];

        api.sendMessage({

          body: `🧟👋 ${user.name} `,

          mentions: [{ tag: user.name, id: user.id }]

        }, threadID);

      } else {

        api.sendMessage("⚠️ ঠিক করে সিলেক্ট কর 🧟.", threadID, messageID);

      }

    } else {

      api.sendMessage("⚠️ Please reply with the number.", threadID, messageID);

    }

  }

};
