const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "chor",
    version: "1.0.3",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    shortDescription: "Expose your tagged or replied friend as a thief!",
    longDescription: "Sends a Scooby Doo style meme with the tagged/replied user's avatar.",
    category: "pro",
    guide: {
      en: "{pn} @mention or reply to expose someone as a thief",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("❗ Tag or reply to someone else to expose them, not yourself!");
    }

    // Prevent self-targeting
    if (targetID === event.senderID) {
      return message.reply("❗ You can't expose yourself, tag or reply to someone else!");
    }

    const baseFolder = path.join(__dirname, "NAFIJ");
    const bgPath = path.join(baseFolder, "chor.png");
    const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
    const outputPath = path.join(baseFolder, `chor_result_${targetID}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      // Download background image once
      if (!fs.existsSync(bgPath)) {
        const imgUrl = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/chor.png";
        const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      // Fetch and circle avatar
      const avatarBuffer = (
        await axios.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
          responseType: "arraybuffer",
        })
      ).data;

      await fs.writeFile(avatarPath, avatarBuffer);

      const avatarImg = await jimp.read(avatarPath);
      avatarImg.circle();
      await avatarImg.writeAsync(avatarPath);

      // Compose image with background and avatar
      const bg = await jimp.read(bgPath);
      bg.resize(500, 670);
      const avatarCircle = await jimp.read(avatarPath);
      avatarCircle.resize(111, 111);
      bg.composite(avatarCircle, 48, 410);

      const finalBuffer = await bg.getBufferAsync("image/png");
      fs.writeFileSync(outputPath, finalBuffer);

      // Get real username
      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Someone";

      // Send message with attachment and mention
      await message.reply(
        {
          body: `╭──────•◈•───────╮\n\n🤣😹\nমুরগির দুধ চুরি করতে গিয়া ধরা খেলো ${tagName} 🐸\n\n╰──────•◈•───────╯`,
          mentions: [{ tag: tagName, id: targetID }],
          attachment: fs.createReadStream(outputPath),
        },
        () => {
          fs.unlinkSync(avatarPath);
          fs.unlinkSync(outputPath);
        }
      );
    } catch (err) {
      console.error("❌ Chor Command Error:", err);
      message.reply("❌ | সমস্যা হইসে ভাই। আরেকবার try কর।");
    }
  },
};