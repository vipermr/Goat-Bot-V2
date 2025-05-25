const axios = require("axios");
const fs = require("fs-extra");
const canvas = require("canvas");

module.exports = {
  config: {
    name: "mia",
    aliases: ["mia khalifa"],
    author: "Otineeeeyyyy + Modified by NAFIJ",
    countDown: 5,
    role: 0,
    category: "write",
    shortDescription: {
      en: "Add text to Mia's board",
    },
    guide: {
      en: "{pn} <text> or reply with text"
    }
  },

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = text.split(" ");
      const lines = [];
      let line = "";
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
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
          line += `${words.shift()} `;
        else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, type } = event;
    let text = args.join(" ");
    if (!text && messageReply?.body) text = messageReply.body;

    if (!text)
      return api.sendMessage("Please enter the content or reply to a message.", threadID, messageID);

    const { loadImage, createCanvas } = canvas;
    const imgPath = __dirname + "/cache/mia-template.jpg";

    // Download the image once if not cached
    if (!fs.existsSync(imgPath)) {
      const imgData = await axios.get("https://i.postimg.cc/L5kW6ttJ/iXbcwYy.jpg", {
        responseType: "arraybuffer"
      });
      fs.writeFileSync(imgPath, Buffer.from(imgData.data, "utf-8"));
    }

    const baseImage = await loadImage(imgPath);
    const cnv = createCanvas(baseImage.width, baseImage.height);
    const ctx = cnv.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, cnv.width, cnv.height);

    // Text styling
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "start";

    const lines = await this.wrapText(ctx, text, 600);
    const lineHeight = 26;
    const startY = 120;
    lines.forEach((line, i) => {
      ctx.fillText(line, 50, startY + i * lineHeight);
    });

    const outPath = __dirname + "/cache/mia-out.png";
    fs.writeFileSync(outPath, cnv.toBuffer());

    return api.sendMessage(
      {
        body: "",
        attachment: fs.createReadStream(outPath)
      },
      threadID,
      () => fs.unlinkSync(outPath),
      messageID
    );
  }
};