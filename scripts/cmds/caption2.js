const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "caption",
    version: "1.3",
    author: "NAFIJ",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send random Islamic quote with image"
    },
    longDescription: {
      en: "Sends a random Islamic caption and image"
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // Fetch caption
      const res1 = await axios.get("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/json/randomquotes.json");
      const captions = res1.data.captions;
      const randomCaption = captions[Math.floor(Math.random() * captions.length)];

      // Fetch image
      const res2 = await axios.get("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/json/randomimagecaption.json");
      const images = res2.data.images;
      const randomImage = images[Math.floor(Math.random() * images.length)];

      // Folder setup
      const folderPath = path.join(__dirname, "cache", "NAFIJ");
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

      const filePath = path.join(folderPath, "caption.jpg");

      // Try downloading image
      try {
        const img = await axios.get(randomImage, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "image/*"
          }
        });
        fs.writeFileSync(filePath, Buffer.from(img.data, "binary"));

        return api.sendMessage({
          body: `🕋 ${randomCaption}\n\n- NAFIJ_😐`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);
      } catch (imgErr) {
        console.error("Image load failed:", imgErr.message);
        return api.sendMessage(`🕋 ${randomCaption}\n\n- NAFIJ_✅\n\n(Note: Image load failed)`, event.threadID);
      }

    } catch (err) {
      console.error("Caption fetch failed:", err.message);
      return api.sendMessage("Error: Unable to fetch captions. Please try again later.", event.threadID);
    }
  }
};