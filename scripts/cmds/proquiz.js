const axios = require("axios");

module.exports = {
  config: {
    name: "quizpro",
    aliases: [],
    version: "1.0",
    author: "NAFIJ x ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Pro level quiz challenge",
    longDescription: "25 question quiz from BD & Science. Win coins!",
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, senderID, messageID } = event;
    let score = 0;
    const totalQuestions = 25;
    let currentQuestion = 0;
    const userID = senderID;

    let res;
    try {
      res = await axios.get("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/json/quizpro.json");
    } catch (err) {
      return api.sendMessage("Failed to fetch questions. Try again later.", threadID, messageID);
    }

    const allQuestions = res.data;
    const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, totalQuestions);

    const sendQuestion = async () => {
      if (currentQuestion >= totalQuestions) {
        const result = `✅ Quiz Done!\nCorrect: ${score}/${totalQuestions}\n`;
        const reward = score * 1500 - (totalQuestions - score) * 500;

        await usersData.addMoney(userID, reward);
        return api.sendMessage(`${result}${reward > 0 ? `You won +$${reward}` : `You lost $${Math.abs(reward)}`}`, threadID);
      }

      const q = shuffled[currentQuestion];
      const optionsText = q.options.map((opt, i) => `${i + 1}. ${opt}`).join("\n");

      api.sendMessage(
        `(${currentQuestion + 1}/${totalQuestions})\n${q.question}\n\n${optionsText}\n\n⏳ You have 10 seconds to answer!`,
        threadID,
        async (err, info) => {
          const correctIndex = q.options.indexOf(q.answer) + 1;

          const answerHandler = async (reply) => {
            if (reply.senderID !== userID) {
              return api.sendMessage("😤 Eta Tor Ta Na, Nijer Chorkai Tel De 😾", threadID, reply.messageID);
            }

            const ans = reply.body?.trim();
            if (!["1", "2", "3", "4"].includes(ans)) return;

            if (parseInt(ans) === correctIndex) {
              score++;
              api.sendMessage("✅ Correct!", threadID);
            } else {
              api.sendMessage(`❌ Wrong! Correct ans: ${correctIndex}. ${q.answer}`, threadID);
            }

            currentQuestion++;
            setTimeout(() => sendQuestion(), 1500);
          };

          const timeout = setTimeout(() => {
            api.sendMessage(`⏰ Time's up! Ans was: ${correctIndex}. ${q.answer}`, threadID);
            currentQuestion++;
            setTimeout(() => sendQuestion(), 1500);
          }, 10000);

          api.listenMqtt((callback) => {
            if (callback.threadID === threadID && callback.messageID !== info.messageID) {
              clearTimeout(timeout);
              answerHandler(callback);
            }
          });
        }
      );
    };

    sendQuestion();
  }
};