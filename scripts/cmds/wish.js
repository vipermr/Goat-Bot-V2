const jimp = require("jimp");
const fs = require("fs");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "wish",
    aliases: ["bwish"],
    version: "2.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    shortDescription: "Wish someone a happy birthday",
    longDescription: "",
    category: "system",
    guide: {
      en: "{pn} [@mention] or reply to someone"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    const mention = Object.keys(event.mentions || {});
    const replyUser = event.messageReply?.senderID;
    const userId = mention[0] || replyUser || args[0];

    if (!userId) return message.reply("⚠️ | Please mention or reply to someone to wish!");

    try {
      const userInfo = await api.getUserInfo(userId);
      const userName = userInfo[userId]?.name || "Unknown User";
      const currentDate = moment().tz("Asia/Dhaka").format("DD-MM-YYYY");
      const currentTime = moment().tz("Asia/Dhaka").format("hh:mm:ss A");

      const imgPath = await createBirthdayImage(userId);
      const msg = `
┏┓｡･ﾟﾟ･｡｡ﾟ♡🎈🎈
┃┗┛ 𝐇𝐚𝐩𝐩𝐲•°•♡🎁
┃┏┓┃　.  𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 🧁🍰
┗┛┗┛　

╔╦══••✠•❀❀•✠••══╦╗
           ${userName}
╚╩══••✠•❀❀•✠••══╩╝

- Wishing you endless happiness and joy on your special day!

- Many many happy returns of the day, dear ${userName}! 🥳🎉

- Date ⇏ ${currentDate}
- Time ⇏ ${currentTime}
`;

      message.reply({
        body: msg,
        mentions: [{ tag: userName, id: userId }],
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.error(err);
      message.reply("❌ | Failed to send birthday wish.");
    }
  }
};

async function createBirthdayImage(userId) {
  const avatar = await jimp.read(`https://graph.facebook.com/${userId}/picture?width=512&height=512`);
  avatar.circle();

  const bg = await jimp.read("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/wish.jpg");
  bg.resize(1000, 667).composite(avatar.resize(320, 320), 346, 82);

  const path = __dirname + `/tmp/wish_${userId}.jpg`;
  await bg.writeAsync(path);
  return path;
}