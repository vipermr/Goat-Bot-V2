module.exports = {
  config: {
    name: "married",
    aliases: ["married"],
    version: "1.3",
    author: "kivv",
    countDown: 5,
    role: 0,
    shortDescription: "get a wife",
    longDescription: "",
    category: "married",
    guide: "{@mention} or reply"
  },

  onLoad: async function () {
    const { resolve } = require("path");
    const { existsSync, mkdirSync } = require("fs-extra");
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + `/cache/canvas/`;
    const path = resolve(__dirname, "cache/canvas", "marriedv5.png");
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path))
      await downloadFile(
        "https://i.ibb.co/mhxtgwm/49be174dafdc259030f70b1c57fa1c13.jpg",
        path
      );
  },

  circle: async function (image) {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
  },

  makeImage: async function ({ senderID, targetID }) {
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const jimp = require("jimp");
    const __root = path.resolve(__dirname, "cache", "canvas");

    let baseImage = await jimp.read(__root + "/marriedv5.png");
    let pathImg = __root + `/married_${senderID}_${targetID}.png`;

    let avatarSender = __root + `/avt_${senderID}.png`;
    let avatarTarget = __root + `/avt_${targetID}.png`;

    let getSenderAvatar = (
      await axios.get(
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(avatarSender, Buffer.from(getSenderAvatar, "utf-8"));

    let getTargetAvatar = (
      await axios.get(
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(avatarTarget, Buffer.from(getTargetAvatar, "utf-8"));

    let circleSender = await jimp.read(await this.circle(avatarSender));
    let circleTarget = await jimp.read(await this.circle(avatarTarget));

    // Left image: x=100, y=20 (original)
    // Right image: x=240, y=20 (10px gap after left)
    baseImage
      .composite(circleTarget.resize(130, 130), 100, 20)
      .composite(circleSender.resize(130, 130), 240, 20);

    let raw = await baseImage.getBufferAsync("image/png");

    fs.writeFileSync(pathImg, raw);

    fs.unlinkSync(avatarSender);
    fs.unlinkSync(avatarTarget);

    return pathImg;
  },

  onStart: async function ({ event, api }) {
    const fs = require("fs-extra");
    const { threadID, messageID, senderID } = event;

    const mention = Object.keys(event.mentions);
    let targetID;

    if (mention.length > 0) {
      targetID = mention[0];
    } else if (event.messageReply && event.messageReply.senderID) {
      targetID = event.messageReply.senderID;
    } else {
      return api.sendMessage(
        "Please mention a user or reply to their message.",
        threadID,
        messageID
      );
    }

    if (targetID === senderID) {
      return api.sendMessage(
        "You cannot marry yourself! Please mention or reply to someone else.",
        threadID,
        messageID
      );
    }

    this.makeImage({ senderID, targetID }).then((path) => {
      api.sendMessage(
        { body: "", attachment: fs.createReadStream(path) },
        threadID,
        () => fs.unlinkSync(path),
        messageID
      );
    });
  }
};