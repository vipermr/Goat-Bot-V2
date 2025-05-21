module.exports = {
  config: {
    name: "ghibli",
    aliases:[],
    version: "1.0",
    author: "♡︎ 𝙴𝙿𝙸𝙲 ♡︎",
    countDown: 3, 
    role: 0,
    longDescription: {
      vi: "",
      en: "Get image from your provided prompt",
    },
    category: "IMAGE",
    guide: {
      vi: "",
      en: "{pn} prompt to generate image with ghibli art studio",
    },
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      const text = args.join(" ");
      if (!text) {
        return message.reply("Please provide a prompt.");
      }

      let prompt = `Ghibli Art: ${text}`;

      
      const waitingMessage = await message.reply("✨ | creating your ghibli request...");
      api.setMessageReaction("🖇️", event.messageID, () => {}, true);
      const startTime = new Date().getTime();

      const h = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json";
      const API = `${h}/ghibli?prompt=${encodeURIComponent(prompt)}`;

      
      const imageStream = await global.utils.getStreamFromURL(API);
      const endTime = new Date().getTime();
      const timeTaken = (endTime - startTime) / 1000;

      
      await message.reply({
        body: `Here is your generated image\n\n⏱️𝗧𝗮𝗸𝗲𝗻 𝗧𝗶𝗺𝗲: ${timeTaken} second`,
        attachment: imageStream,
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      
      await api.unsendMessage(waitingMessage.messageID);

    } catch (error) {
      console.log(error);
      message.reply("Failed to generate the image. Please try again later.");
    }
  },
};
