const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "hack",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: { en: "Hack the user and generate meme" }
  },

  onStart: async function ({ api, event }) {
    try {
      const mentionID = Object.keys(event.mentions || {})[0];
      const replyID = event.type === "message_reply" ? event.messageReply.senderID : null;
      const targetID = mentionID || replyID || event.senderID;

      const userInfo = await api.getUserInfo(targetID);
      let fbName = userInfo[targetID]?.name || "Unknown User";

      // Customize name if desired
      if (fbName === "NAFIJ Rahaman") fbName = "NAFIJ";

      const backgroundPath = path.join(__dirname, "NAFIJ", "hack.jpg");
      const avatarPath = path.join(__dirname, "tmp", `avatar_${targetID}.png`);

      // Download background if not exists
      if (!fs.existsSync(backgroundPath)) {
        fs.ensureDirSync(path.dirname(backgroundPath));
        const url = "https://raw.githubusercontent.com/alkama844/res/main/image/hack.jpg";
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(backgroundPath, res.data);
      }

      // Download avatar
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });
      fs.writeFileSync(avatarPath, avatarData.data);

      // Load images
      const bg = await Jimp.read(backgroundPath);
      const avatar = await Jimp.read(avatarPath);
      avatar.resize(70, 70);
      bg.composite(avatar, 53, 290);

      // Load font
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      bg.print(font, 140, 310, fbName);

      const finalPath = path.join(__dirname, "tmp", `hack_final_${event.messageID}.png`);
      await bg.writeAsync(finalPath);

      // Cleanup
      fs.unlinkSync(avatarPath);

      // Send image
      return api.sendMessage(
        {
          body: `💻 Hack complete.\nTarget: ${fbName}\nStatus: EXPOSED.`,
          mentions: [{ tag: fbName, id: targetID }],
          attachment: fs.createReadStream(finalPath),
        },
        event.threadID,
        () => fs.unlinkSync(finalPath),
        event.messageID
      );
    } catch (err) {
      console.error("Hack command error:", err);
      return api.sendMessage("❌ Hack failed. Maybe the security is high...", event.threadID, null, event.messageID);
    }
  }
};