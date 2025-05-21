const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fakechat2",
    aliases: ["fchat2"],
    version: "1.0",
    role: 2, // Only bot admins
    premium: false,
    author: "NAFIJ",
    description: "Create a fake Messenger-style chat image",
    category: "system",
    countDown: 10,
  },

  onStart: async ({ event, message, usersData, args }) => {
    try {
      const userText = args.join(" ") || "Kire tui koi geli?";
      const uid = Object.keys(event.mentions)[0] || event.senderID;
      const userName = await usersData.getName(uid);

      const avatarURL = `https://graph.facebook.com/${uid}/picture?width=256&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarBuffer = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
      const avatar = await loadImage(avatarBuffer);

      const width = 800, height = 450;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background Messenger-style
      ctx.fillStyle = "#e5ddd5";
      ctx.fillRect(0, 0, width, height);

      // Avatar circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(60, 60, 40, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 20, 20, 80, 80);
      ctx.restore();

      // Name
      ctx.fillStyle = "#000000";
      ctx.font = "bold 28px Arial";
      ctx.fillText(userName, 120, 55);

      // User message bubble
      ctx.fillStyle = "#ffffff";
      ctx.roundRect(120, 80, 500, 60, 20).fill();
      ctx.fillStyle = "#000000";
      ctx.font = "20px Arial";
      ctx.fillText(userText, 135, 115);

      // Fake bot reply bubble
      const fakeReplies = [
        "Ektu wait kor tui.",
        "Hmm dekhchi.",
        "Accha pore call kor.",
        "Tui ki baje joke disi!",
        "Tora bar bar ektu kom msg kor."
      ];
      const botReply = fakeReplies[Math.floor(Math.random() * fakeReplies.length)];

      ctx.fillStyle = "#dcf8c6";
      ctx.roundRect(180, 180, 500, 60, 20).fill();
      ctx.fillStyle = "#000000";
      ctx.font = "20px Arial";
      ctx.fillText(botReply, 195, 215);

      // Save image
      const buffer = canvas.toBuffer();
      const imgPath = path.join(__dirname, "fakechat2.png");
      fs.writeFileSync(imgPath, buffer);

      message.reply({
        body: "Here's your Messenger-style fake chat:",
        attachment: fs.createReadStream(imgPath),
      }, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.log("Fakechat2 Error:", err);
      message.reply("Kisu ekta vul hoise. Try again!");
    }
  }
};

// Rounded rectangle function
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
  return this;
};