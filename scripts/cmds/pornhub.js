const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "pornhub",
    aliases: ["phub"],
    author: "junjam",
    version: "1.0",
    countDown: 0,
    role: 0,
    shortDescription: { en: "" },
    longDescription: { en: "" },
    category: "fun",
    guide: { en: "" }
  },
  
  wrapText: async (ctx, text, maxWidth) => {
    if (ctx.measureText(text).width < maxWidth) return [text];
    if (ctx.measureText('W').width > maxWidth) return null;
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return lines;
  },

  onStart: async function ({ api, event, args }) {
    const { senderID, threadID, messageID, messageReply } = event;

    // If reply exists, get target ID and info from replied message, else use sender info
    let targetID = senderID;
    if (messageReply && messageReply.senderID) targetID = messageReply.senderID;

    // Special check for the specific user ID
    if (targetID == "100058371606434") {
      return api.sendMessage("VAG SALA 👻✅", threadID, messageID);
    }

    // Text source: If reply has text, use it, else args join
    let text = "";
    if (messageReply && messageReply.body) text = messageReply.body;
    else text = args.join(" ");

    if (!text) return api.sendMessage("Post the content of the comment on ponhub", threadID, messageID);

    // Get target user info (to get avatar & name)
    let targetInfo = await api.getUserInfo(targetID);
    let name = targetInfo[targetID]?.name || "User";
    let avatarUrl = targetInfo[targetID]?.thumbSrc;

    if (!avatarUrl) return api.sendMessage("Can't get avatar of target user.", threadID, messageID);

    let avatarPath = __dirname + "/cache/avt.png";
    let pathImg = __dirname + "/cache/porn.png";

    try {
      // Download avatar and base template image
      const [avatarBuffer, baseBuffer] = await Promise.all([
        axios.get(avatarUrl, { responseType: "arraybuffer" }).then(res => res.data),
        axios.get("https://raw.githubusercontent.com/ProCoderMew/Module-Miraiv2/main/data/phub.png", { responseType: "arraybuffer" }).then(res => res.data)
      ]);

      fs.writeFileSync(avatarPath, avatarBuffer);
      fs.writeFileSync(pathImg, baseBuffer);

      let image = await loadImage(avatarPath);
      let baseImage = await loadImage(pathImg);

      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 30, 310, 70, 70);

      ctx.font = "700 23px Arial";
      ctx.fillStyle = "#FF9900";
      ctx.textAlign = "start";
      ctx.fillText(name, 115, 350);

      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "start";

      // Adjust font size to fit width limit
      let fontSize = 23;
      while (ctx.measureText(text).width > 2600) {
        fontSize--;
        ctx.font = `400 ${fontSize}px Arial, sans-serif`;
      }

      const lines = await this.wrapText(ctx, text, 1160);

      // Draw multi-line text with line spacing
      const startX = 30;
      let startY = 430;
      const lineHeight = fontSize + 8;

      for (const line of lines) {
        ctx.fillText(line, startX, startY);
        startY += lineHeight;
      }

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      fs.removeSync(avatarPath);

      return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);
    } catch (e) {
      return api.sendMessage("An error occurred while processing the image.", threadID, messageID);
    }
  }
};