const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const jimp = require('jimp');

module.exports = {
  config: {
    name: "fakechat3",
    version: "1.1",
    author: "kshitiz & NAFIJ",
    countDown: 5,
    role: 0,
    shortDescription: "Fake Facebook chat",
    longDescription: "Generate a Facebook-style chat image with user and custom message",
    category: "fun",
    guide: "{p}fakechat @mention | message OR reply to message with {p}fakechat | message"
  },

  onStart: async function ({ api, event, args }) {
    let targetID;
    let displayName = "Someone";

    if (event.type === "message_reply" && event.messageReply.senderID) {
      targetID = event.messageReply.senderID;
      displayName = event.messageReply.senderID === api.getCurrentUserID() ? "You" : "RepliedUser";
    }

    const mention = Object.keys(event.mentions);
    if (mention.length > 0) {
      targetID = mention[0];
      displayName = event.mentions[targetID];
    }

    if (!targetID) {
      return api.sendMessage("Mention or reply to someone.\nFormat: @user | message OR reply with | message", event.threadID, event.messageID);
    }

    const text = args.join(" ").split('|')[1]?.trim();
    if (!text) return api.sendMessage("Missing message after '|'.\nExample: @user | Hello!", event.threadID, event.messageID);

    const profilePic = await getUserProfilePic(targetID);
    if (!profilePic) return api.sendMessage("Couldn't fetch profile picture.", event.threadID, event.messageID);

    const avatar = await createCircularImage(profilePic, 60);
    const canvas = createCanvas(720, 405);
    const ctx = canvas.getContext('2d');

    const background = await loadImage("https://i.ibb.co/SVmYmrn/420578140-383334164549458-685915027190897272-n.jpg");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    drawImage(ctx, avatar, 30, 160);
    ctx.font = '22px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText(displayName, 100, 140);

    // Wrap text
    const maxWidth = 500;
    const lineHeight = 28;
    const lines = wrapText(ctx, text, maxWidth);
    const boxHeight = lines.length * lineHeight + 20;

    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fillRect(110, 160, maxWidth + 20, boxHeight);

    ctx.fillStyle = '#FFF';
    lines.forEach((line, i) => {
      ctx.fillText(line, 125, 190 + i * lineHeight);
    });

    const imgPath = path.join(__dirname, "cache", `fakechat_${Date.now()}.png`);
    const out = fs.createWriteStream(imgPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on('finish', () => {
      api.sendMessage({ attachment: fs.createReadStream(imgPath) }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
    });
  }
};

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (let word of words) {
    const test = line + word + ' ';
    const width = ctx.measureText(test).width;
    if (width > maxWidth) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

async function getUserProfilePic(userID) {
  try {
    const res = await axios.get(
      `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(res.data, 'binary');
  } catch (err) {
    console.error("Error fetching avatar:", err);
    return null;
  }
}

async function createCircularImage(imageData, size) {
  const img = await jimp.read(imageData);
  img.resize(size, size).circle();
  return img.getBufferAsync(jimp.MIME_PNG);
}

function drawImage(ctx, imageData, x, y) {
  loadImage(imageData).then(image => {
    ctx.drawImage(image, x, y);
  }).catch(err => console.error("Image draw error:", err));
}