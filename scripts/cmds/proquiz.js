const axios = require("axios");

const cooldown = new Map();
global.quizSessions = global.quizSessions || {};
global.dailyQuizLimit = global.dailyQuizLimit || {};

module.exports = {
  config: {
    name: "quizpro",
    aliases: [],
    version: "2.2",
    author: "NAFIJ x PRO",
    countDown: 0,
    role: 0,
    shortDescription: "One-question quiz game",
    longDescription: "BD/Science quiz with 15s timer and coin reward",
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, senderID, messageID } = event;
    const now = Date.now();

    // Daily limit reset (every midnight)
    const today = new Date().toLocaleDateString();
    if (!global.dailyQuizLimit[senderID] || global.dailyQuizLimit[senderID].date !== today) {
      global.dailyQuizLimit[senderID] = {
        count: 0,
        date: today
      };
    }

    // Check if user reached daily limit
    if (global.dailyQuizLimit[senderID].count >= 20) {
      return api.sendMessage("⛔ Bujhi quiz khub posondo! Kintu daily 20 barer limit ache. Kal abar try koro.", threadID, messageID);
    }

    // Cooldown check
    if (cooldown.has(senderID) && now - cooldown.get(senderID) < 7000) {
      const left = Math.ceil((7000 - (now - cooldown.get(senderID))) / 1000);
      return api.sendMessage(`🥺 Wait koro Babu... ${left}s baki`, threadID, messageID);
    }
    cooldown.set(senderID, now);

    let res;
    try {
      res = await axios.get("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/json/quizpro.json");
    } catch (err) {
      return api.sendMessage("❌ Quiz load korte parlam na. Try again poray.", threadID, messageID);
    }

    const questions = res.data;
    const q = questions[Math.floor(Math.random() * questions.length)];
    const correctIndex = q.options.indexOf(q.answer) + 1;
    const optionsText = q.options.map((opt, i) => `${i + 1}. ${opt}`).join("\n");

    const quizMessage = `🧠 *Quiz Time!*\n\n${q.question}\n\n${optionsText}\n\n⏳ *15s ache.* Reply with 1, 2, 3, or 4`;

    api.sendMessage(quizMessage, threadID, async (err, info) => {
      if (err) return;

      global.quizSessions[info.messageID] = {
        senderID,
        correctIndex,
        answer: q.answer,
        threadID,
        timeout: setTimeout(() => {
          api.sendMessage(`⏰ Time's up!\nSothik chilo: ${correctIndex}. ${q.answer}`, threadID);
          delete global.quizSessions[info.messageID];
        }, 15000)
      };
    });
  },

  onChat: async function ({ event, api, usersData }) {
    const { messageID, threadID, senderID, body } = event;
    const userAns = parseInt(body?.trim());

    if (!["1", "2", "3", "4"].includes(body?.trim())) return;

    for (const msgID in global.quizSessions) {
      const session = global.quizSessions[msgID];

      if (session.threadID === threadID && session.senderID === senderID) {
        clearTimeout(session.timeout);
        delete global.quizSessions[msgID];

        // Count towards daily limit
        global.dailyQuizLimit[senderID].count++;

        if (userAns === session.correctIndex) {
          await usersData.addMoney(senderID, 1500);
          return api.sendMessage(`✅ Sothik uttor! +$1500 paiso`, threadID);
        } else {
          await usersData.addMoney(senderID, -500);
          return api.sendMessage(`❌ Bhul hoise!\nSothik chilo: ${session.correctIndex}. ${session.answer}\n-$500 kete gese`, threadID);
        }
      }
    }
  }
};
