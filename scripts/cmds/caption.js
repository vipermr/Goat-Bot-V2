const axios = require("axios");

module.exports = {
  config: {
    name: "captiontext",
    version: "1.0",
    author: "NAFIJ",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Send Islamic caption (text only)"
    },
    longDescription: {
      en: "Sends a random Islamic quote without any image"
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/json/randomquotes.json");
      const captions = res.data.captions;
      const randomCaption = captions[Math.floor(Math.random() * captions.length)];

      api.sendMessage(`🕋 ${randomCaption}\n\n- NAFIJ🌠❤️`, event.threadID);
    } catch (err) {
      console.error("Caption fetch failed:", err.message);
      api.sendMessage("Error: Unable to fetch captions. Please try again later.", event.threadID);
    }
  }
};