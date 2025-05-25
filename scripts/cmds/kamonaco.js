module.exports = {
  config: {
    name: "kemon aso",
    version: "1.0",
    author: "Jaychris Garcia",
    countDown: 5,
    role: 0,
    shortDescription: "sarcasm",
    longDescription: "sarcasm",
    category: "reply",
  },
  onStart: async function () { },
  onChat: async function ({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() == "kemon aso") {
      return message.reply("- **আলহামদুলিল্লাহ**\n**আমি ভালো আছি** 🙂\n\n**তুমি কেমন আছো...**? 🤔😊");
    }
  }
};