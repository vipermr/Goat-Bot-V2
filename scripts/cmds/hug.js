const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "hug",
    version: "3.1.1",
    hasPermission: 0,
    credits: "Priyansh Rajput",
    description: "Hug someone 🥰",
    commandCategory: "img",
    usages: "[@mention]",
    cooldowns: 5
  },

  onLoad: async function () {
    const dirMaterial = path.join(__dirname, "cache", "canvas");
    const imagePath = path.join(dirMaterial, "hugv1.png");

    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });

    if (!fs.existsSync(imagePath)) {
      const imageURL = "https://i.ibb.co/3YN3T1r/q1y28eqblsr21.jpg";
      const response = await axios.get(imageURL, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));
    }
  },

  onStart: async function ({ event, api }) {
    try {
      const { threadID, messageID, senderID, mentions } = event;
      const mention = Object.keys(mentions);

      if (!mention[0]) return api.sendMessage("⚠️ Please mention 1 person to hug!", threadID, messageID);

      const one = senderID, two = mention[0];
      const imagePath = await makeImage({ one, two });

      return api.sendMessage({ body: "🤗 Here's your hug!", attachment: fs.createReadStream(imagePath) }, threadID, () => fs.unlinkSync(imagePath), messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage(`❌ An error occurred:\n\n${error.message}`, event.threadID, event.messageID);
    }
  }
};

async function makeImage({ one, two }) {
  const __root = path.join(__dirname, "cache", "canvas");
  const hugImagePath = path.join(__root, "hugv1.png");

  let batgiam_img = await jimp.read(hugImagePath);
  let avatarOnePath = path.join(__root, `avt_${one}.png`);
  let avatarTwoPath = path.join(__root, `avt_${two}.png`);
  let finalImagePath = path.join(__root, `hug_${one}_${two}.png`);

  let avatarOne = await getFacebookAvatar(one);
  let avatarTwo = await getFacebookAvatar(two);

  fs.writeFileSync(avatarOnePath, avatarOne);
  fs.writeFileSync(avatarTwoPath, avatarTwo);

  let circleOne = await jimp.read(await circle(avatarOnePath));
  let circleTwo = await jimp.read(await circle(avatarTwoPath));

  batgiam_img.composite(circleOne.resize(150, 150), 320, 100).composite(circleTwo.resize(130, 130), 280, 280);

  let raw = await batgiam_img.getBufferAsync("image/png");
  fs.writeFileSync(finalImagePath, raw);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return finalImagePath;
}

async function getFacebookAvatar(userID) {
  const fbURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;
  const response = await axios.get(fbURL, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "utf-8");
}

async function circle(imagePath) {
  let image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
}
