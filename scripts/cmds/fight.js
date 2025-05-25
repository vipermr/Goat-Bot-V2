const TIMEOUT_SECONDS = 9;
const ongoingFights = new Map();
const gameInstances = new Map();

module.exports = {
  config: {
    name: "fight",
    version: "1.1",
    author: "Shikaki + NAFIJ Modified",
    role: 0,
    category: "fun",
    shortDescription: "Start a funny fight",
    longDescription: "Fight game with emojis, timeouts, and reply support.",
    guide: "{pn} @mention or reply to a message"
  },

  onStart: async function ({ event, message, api, usersData }) {
    const threadID = event.threadID;

    if (ongoingFights.has(threadID)) {
      return message.reply("🤕 A fight is already in progress in this group!");
    }

    let opponentID;
    if (event.type === "message_reply") {
      opponentID = event.messageReply.senderID;
    } else {
      const mention = Object.keys(event.mentions);
      if (mention.length !== 1) return message.reply("🙅 Mention or reply to exactly 1 person.");
      opponentID = mention[0];
    }

    const challengerID = event.senderID;
    if (challengerID === opponentID) return message.reply("🤦 You can't fight yourself!");

    const challenger = await usersData.getName(challengerID);
    const opponent = await usersData.getName(opponentID);

    const fight = {
      participants: [
        { id: challengerID, name: challenger, hp: 100 },
        { id: opponentID, name: opponent, hp: 100 }
      ],
      currentPlayer: Math.random() < 0.5 ? challengerID : opponentID,
      threadID
    };

    const gameInstance = {
      fight,
      lastAttack: null,
      lastPlayer: null,
      timeoutID: null,
      turnMessageSentTo: new Set()
    };

    ongoingFights.set(threadID, fight);
    gameInstances.set(threadID, gameInstance);

    const currentPlayer = fight.participants.find(p => p.id === fight.currentPlayer);
    const notCurrent = fight.participants.find(p => p.id !== fight.currentPlayer);

    message.send(
      `🌸 ${currentPlayer.name} challenged ${notCurrent.name} to a battle!\n` +
      `🙆 HP: ${currentPlayer.hp} vs ${notCurrent.hp}\n` +
      `⛄ It's ${currentPlayer.name}'s turn!\n🤧 Use: kick, punch, slap or forfeit`
    );

    startTimeout(threadID, message);
  },

  onChat: async function ({ event, message }) {
    const threadID = event.threadID;
    const gameInstance = gameInstances.get(threadID);
    if (!gameInstance) return;

    const { fight, lastPlayer, turnMessageSentTo } = gameInstance;
    const currentPlayerID = fight.currentPlayer;
    const currentPlayer = fight.participants.find(p => p.id === currentPlayerID);

    if (event.senderID !== currentPlayerID) {
      if (!turnMessageSentTo.has(event.senderID)) {
        message.reply(`🤧 It's ${currentPlayer.name}'s turn! Wait for your move.`);
        turnMessageSentTo.add(event.senderID);
      }
      return;
    }

    clearTimeout(gameInstance.timeoutID);
    const attack = event.body.trim().toLowerCase();
    if (attack === "forfeit") {
      const loser = currentPlayer.name;
      const winner = fight.participants.find(p => p.id !== currentPlayerID).name;
      message.send(`🙅 ${loser} forfeited! 🏆 ${winner} wins! 🤕🤧`);
      endFight(threadID);
      return;
    }

    if (!["kick", "punch", "slap"].includes(attack)) {
      return message.reply("🤦 Invalid move! Use kick, punch, slap, or forfeit.");
    }

    const damage = Math.random() < 0.1 ? 0 : Math.floor(Math.random() * 20 + 10);
    const opponent = fight.participants.find(p => p.id !== currentPlayerID);
    opponent.hp -= damage;

    message.send(
      `🥊 ${currentPlayer.name} used ${attack} on ${opponent.name} and did ${damage} damage! 🌸\n` +
      `🙆 HP: ${currentPlayer.hp} vs ${opponent.hp} 🤧`
    );

    if (opponent.hp <= 0) {
      message.send(`🏆 ${currentPlayer.name} wins! ${opponent.name} is knocked out! 🤕⛄`);
      endFight(threadID);
    } else {
      fight.currentPlayer = opponent.id;
      gameInstance.lastPlayer = currentPlayer;
      gameInstance.lastAttack = attack;
      gameInstance.turnMessageSentTo.clear();

      const next = fight.participants.find(p => p.id === fight.currentPlayer);
      message.send(`⛄ It's now ${next.name}'s turn! 🤧`);
      startTimeout(threadID, message);
    }
  }
};

function startTimeout(threadID, message) {
  const gameInstance = gameInstances.get(threadID);
  if (!gameInstance) return;

  gameInstance.timeoutID = setTimeout(() => {
    const current = gameInstance.fight.participants.find(p => p.id === gameInstance.fight.currentPlayer);
    const opponent = gameInstance.fight.participants.find(p => p.id !== gameInstance.fight.currentPlayer);
    message.send(`🤕 ${current.name} took too long! ⌛ ${opponent.name} wins by default! 🏆`);
    endFight(threadID);
  }, TIMEOUT_SECONDS * 1000);
}

function endFight(threadID) {
  ongoingFights.delete(threadID);
  const gameInstance = gameInstances.get(threadID);
  if (gameInstance?.timeoutID) clearTimeout(gameInstance.timeoutID);
  gameInstances.delete(threadID);
}