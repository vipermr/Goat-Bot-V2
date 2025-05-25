const TIMEOUT_SECONDS = 40;
const botID = global.GoatBot.config?.botID || "100062545513683";
const ongoingFights = new Map();

function getHealthBar(hp) {
  const totalBars = 10;
  const filledBars = Math.max(0, Math.floor(hp / 10));
  return '█'.repeat(filledBars) + '░'.repeat(totalBars - filledBars);
}

module.exports = {
  config: {
    name: "fightbot",
    version: "1.6",
    author: "NAFIJ Fixed+Polished",
    role: 0,
    shortDescription: "🤖 Fight the bot!",
    longDescription: "🤖 Challenge the bot in a fight with graphics!",
    category: "🕹️ Fun",
    guide: "{pn}fightbot"
  },

  onStart: async function ({ event, message, usersData, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    if (ongoingFights.has(threadID)) return message.reply("😤 A fight is already in progress here! 🤕🤧🤦");

    const playerName = await usersData.getName(senderID);
    const botName = await usersData.getName(botID);

    const isBotFirst = Math.random() < 0.5;

    const fight = {
      participants: [
        { id: senderID, name: playerName, hp: 100 },
        { id: botID, name: botName, hp: 100 }
      ],
      currentPlayer: isBotFirst ? botID : senderID,
      timeout: null,
      messageID: null,
      wrongCount: new Map()
    };

    ongoingFights.set(threadID, fight);

    const turnName = isBotFirst ? botName : playerName;
    const msg = `⚔ ${playerName} vs ${botName} ⚔\n\nBoth start with 100 HP!\n\n🌟 ${turnName}'s turn! 🥊\nPlease choose kick - punch - slap`;

    const sent = await message.send(msg);
    fight.messageID = sent.messageID;

    startTurn(threadID, api, fight.messageID);

    if (isBotFirst) {
      setTimeout(() => {
        const move = ["kick", "punch", "slap"][Math.floor(Math.random() * 3)];
        const fakeEvent = { threadID, senderID: botID, body: move };
        module.exports.onChat({ event: fakeEvent, message, api });
      }, 1000);
    }
  },

  onChat: async function ({ event, message, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const body = event.body?.toLowerCase().trim();
    const fight = ongoingFights.get(threadID);

    if (!fight) return;

    const isPlayer = fight.participants.some(p => p.id === senderID);
    if (!isPlayer) return;

    if (fight.currentPlayer !== senderID) {
      if (!fight.wrongCount.has(senderID)) {
        fight.wrongCount.set(senderID, 1);
        return message.reply("❌ Use only: kick, punch, slap or forfeit! 🤕🤧🤦");
      } else {
        const count = fight.wrongCount.get(senderID);
        if (count >= 1) {
          const winner = fight.participants.find(p => p.id !== senderID);
          await api.editMessage(`🏳 ${fight.participants.find(p => p.id === senderID).name} misbehaved!\n🏆 ${winner.name} wins! ⛄🙅`, fight.messageID, threadID);
          return endFight(threadID);
        } else {
          fight.wrongCount.set(senderID, count + 1);
          return message.reply("❌ Use only: kick, punch, slap or forfeit! 🤕🤧🤦");
        }
      }
    }

    if (!["kick", "punch", "slap", "forfeit"].includes(body)) {
      return message.reply("❌ Use only: kick, punch, slap or forfeit! 🤕🤧🤦");
    }

    clearTimeout(fight.timeout);

    if (body === "forfeit") {
      const winner = fight.participants.find(p => p.id !== senderID);
      await api.editMessage(`🏳 ${fight.participants.find(p => p.id === senderID).name} forfeits!\n🏆 ${winner.name} wins! ⛄🙅`, fight.messageID, threadID);
      return endFight(threadID);
    }

    const attacker = fight.participants.find(p => p.id === senderID);
    const opponent = fight.participants.find(p => p.id !== senderID);

    const damage = Math.floor(Math.random() * 26) + 25;
    opponent.hp = Math.max(0, opponent.hp - damage);

    if (opponent.hp <= 0) {
      await api.editMessage(
        `💥 ${attacker.name} used ${body} and hit ${opponent.name} for ${damage} damage!\n` +
        `❤ ${attacker.name}: ${attacker.hp} | ${getHealthBar(attacker.hp)}\n` +
        `💔 ${opponent.name}: 0 | ${getHealthBar(0)} 🌸\n\n` +
        `🏆 ${attacker.name} wins the fight! ${opponent.name} is KO! 🙆🤕`,
        fight.messageID,
        threadID
      );
      return endFight(threadID);
    }

    const msg =
      `💥 ${attacker.name} used ${body} and hit ${opponent.name} for ${damage} damage!\n` +
      `❤ ${attacker.name}: ${attacker.hp} | ${getHealthBar(attacker.hp)}\n` +
      `💔 ${opponent.name}: ${opponent.hp} | ${getHealthBar(opponent.hp)} 🌸\n\n` +
      `Please choose kick - punch - slap`;

    await api.editMessage(msg, fight.messageID, threadID);

    fight.currentPlayer = opponent.id;
    startTurn(threadID, api, fight.messageID);

    if (opponent.id === botID) {
      setTimeout(() => {
        const move = ["kick", "punch", "slap"][Math.floor(Math.random() * 3)];
        const fakeEvent = {
          threadID,
          senderID: botID,
          body: move
        };
        module.exports.onChat({ event: fakeEvent, message, api });
      }, 1000);
    }
  }
};

function startTurn(threadID, api, messageID) {
  const fight = ongoingFights.get(threadID);
  const current = fight.participants.find(p => p.id === fight.currentPlayer);

  if (current.id === botID) return; // Bot has no timeout

  fight.timeout = setTimeout(async () => {
    const winner = fight.participants.find(p => p.id !== current.id);
    await api.editMessage(`⏱ ${current.name} didn't respond in ${TIMEOUT_SECONDS}s!\n🏆 ${winner.name} wins! 🤧🙅`, messageID, threadID);
    endFight(threadID);
  }, TIMEOUT_SECONDS * 1000);
}

function endFight(threadID) {
  const fight = ongoingFights.get(threadID);
  if (fight?.timeout) clearTimeout(fight.timeout);
  ongoingFights.delete(threadID);
}