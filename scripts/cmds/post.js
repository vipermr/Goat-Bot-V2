const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "post",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Mention your friend and write something to post✍️",
    },
  },

  wrapText: async function (ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (const word of words) {
      const testLine = `${line}${word} `;
      const width = ctx.measureText(testLine).width;
      if (width <= maxWidth) {
        line = testLine;
      } else {
        lines.push(line.trim());
        line = `${word} `;
      }
    }

    lines.push(line.trim());
    return lines;
  },

  onStart: async function ({ args, usersData, threadsData, api, event }) {
    const pathImg = __dirname + "/cache/background.png";
    const pathAvt = __dirname + "/cache/avatar.png";
    const id = Object.keys(event.mentions)[0] || event.senderID;
    const userInfo = await api.getUserInfo(id);
    const name = userInfo[id].name;

    const imageUrl = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/post.jpg";

    const avatarBuffer = (
      await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt, Buffer.from(avatarBuffer, "utf-8"));

    const bgBuffer = (
      await axios.get(imageUrl, { responseType: "arraybuffer" })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(bgBuffer, "utf-8"));

    const baseImage = await loadImage(pathImg);
    const baseAvatar = await loadImage(pathAvt);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Text styling
    const commentText = args.slice(args.indexOf("|") + 1).join(" ") || " ";
    ctx.font = "400 23px Arial";
    ctx.fillStyle = "#000000";

    const commentLines = await this.wrapText(ctx, commentText, canvas.width - 100);
    commentLines.forEach((line, i) => {
      ctx.fillText(line, 45, 150 + i * 28);
    });

    ctx.font = "700 23px Arial";
    const nameLines = await this.wrapText(ctx, name, canvas.width - 200);
    nameLines.forEach((line, i) => {
      ctx.fillText(line, 120, 50 + i * 28);
    });

    // Avatar drawing
    const avatarX = 20;
    const avatarY = 24;
    const avatarSize = 80;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(baseAvatar, avatarX, avatarY, avatarSize, avatarSize);

    const finalImage = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalImage);
    fs.removeSync(pathAvt);

    return api.sendMessage(
      {
        body: " ",
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};