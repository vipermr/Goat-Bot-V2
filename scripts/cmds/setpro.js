module.exports = {
  config: {
    name: "setpro",
    aliases: ["ap"],
    version: "1.0",
    author: "Samir B. Thakuri (modded by NAFIJ)",
    role: 0,
    shortDescription: {
      en: "Set coins or exp for a user"
    },
    longDescription: {
      en: "Allows setting coins or experience points for a user by mention or reply"
    },
    category: "economy",
    guide: {
      en: "{pn} [money|exp] [amount] [@mention or reply]"
    }
  },

  onStart: async function ({ args, event, message, usersData }) {
    const permission = ["100058371606434", "100076392488331"];
    if (!permission.includes(event.senderID)) {
      return message.reply("? You do not have permission to use this command. ??бс?");
    }

    const query = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    if (!["money", "exp"].includes(query) || isNaN(amount)) {
      return message.reply("? Invalid usage!\nUse: setpro [money|exp] [amount] [@mention or reply]");
    }

    let targetUser;
    if (event.type === "message_reply") {
      targetUser = event.messageReply.senderID;
    } else {
      const mentionIDs = Object.keys(event.mentions);
      targetUser = mentionIDs[0] || event.senderID;
    }

    const userData = await usersData.get(targetUser);
    if (!userData) return message.reply("?? User data not found.");

    const name = await usersData.getName(targetUser);
    if (query === "exp") {
      await usersData.set(targetUser, {
        money: userData.money,
        exp: amount,
        data: userData.data
      });
      return message.reply(`? Set experience to ${amount} for ${name}. ?`);
    } else {
      await usersData.set(targetUser, {
        money: amount,
        exp: userData.exp,
        data: userData.data
      });
      return message.reply(`? Set coins to ${amount} for ${name}. ?`);
    }
  }
};