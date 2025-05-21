module.exports = {
  config: {
    name: "dice",
    aliases: ["🎲", "ludo"],
    version: "2.1",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    shortDescription: "Play Dice vs Bot or Others",
    longDescription: "Roll dice by choosing a number (1-6), bet and play against the bot or a tagged/replied user",
    category: "game",
    guide: "{pn} <1-6> <amount> [tag or reply to someone for multiplayer]"
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const sender = event.senderID;
    const senderData = await usersData.get(sender);

    const userNumber = parseInt(args[0]);
    const betAmount = parseInt(args[1]);

    // Validate user number and bet
    if (!userNumber || userNumber < 1 || userNumber > 6)
      return message.reply("🎯 | Please choose a number between 1 and 6.");
    if (!Number.isInteger(betAmount) || betAmount < 50)
      return message.reply("❌ | Minimum bet is 50.");
    if (senderData.money < betAmount)
      return message.reply("💸 | You don't have enough money.");

    // Multiplayer check via tag or reply
    let opponentID;
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      opponentID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      opponentID = event.messageReply.senderID;
    }

    // Multiplayer mode
    if (opponentID && opponentID !== sender) {
      const oppData = await usersData.get(opponentID);
      if (!oppData) return message.reply("❌ | Opponent not found in database.");
      if (oppData.money < betAmount)
        return message.reply("💸 | Your opponent doesn't have enough money.");

      const senderRoll = userNumber;
      const opponentRoll = Math.floor(Math.random() * 6) + 1;

      let result = `🎲 Dice Duel 🎲\n\n`;
      result += `🧑 You: ${senderRoll}\n👤 Opponent: ${opponentRoll}\n`;

      if (senderRoll > opponentRoll) {
        senderData.money += betAmount;
        oppData.money -= betAmount;
        result += `\n✅ You win ${betAmount}$!`;
      } else if (senderRoll < opponentRoll) {
        senderData.money -= betAmount;
        oppData.money += betAmount;
        result += `\n❌ You lost ${betAmount}$!`;
      } else {
        result += `\n🤝 It's a draw!`;
      }

      result += `\n\n⚡ Powered by NAFIJ ⚡ & MEHERAJ ⚡`;

      await usersData.set(sender, senderData);
      await usersData.set(opponentID, oppData);
      return message.reply(result);
    }

    // Solo vs Bot
    const botRoll = Math.floor(Math.random() * 6) + 1;
    const userRoll = userNumber;
    let result = `🎲 Dice vs Bot 🎲\n\n🧑 You: ${userRoll}\n🤖 Bot: ${botRoll}\n`;

    if (userRoll > botRoll) {
      senderData.money += betAmount;
      result += `\n✅ You win ${betAmount}$!`;
    } else if (userRoll < botRoll) {
      senderData.money -= betAmount;
      result += `\n❌ You lost ${betAmount}$!`;
    } else {
      result += `\n🤝 It's a draw!`;
    }

    result += `\n\n⚡ Powered by NAFIJ ⚡ & MEHERAJ ⚡`;

    await usersData.set(sender, senderData);
    return message.reply(result);
  }
};