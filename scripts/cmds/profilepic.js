const axios = require("axios");

module.exports = {
  config: {
    name: "profilepic",
    aliases: ["cngpp", "cngppp"],
    version: "1.3",
    author: "NTKhang (edited by NAFIJPRO✅)",
    countDown: 5,
    role: 2,
    shortDescription: "Change bot's avatar",
    longDescription: "Change the bot's avatar using an image URL or by replying to an image.",
    category: "owner",
    guide: "{pn} [<image url> | reply with image] [<caption>] [<expiration (seconds)>]"
  },

  onStart: async function ({ message, event, api, args }) {
    // Get image URL from direct argument, reply or attachment
    const imageURL = (args[0] || "").startsWith("http") ? args.shift() :
                     event.attachments?.[0]?.url || 
                     event.messageReply?.attachments?.[0]?.url;

    const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
    const caption = args.join(" ");

    if (!imageURL) return message.reply("Please provide a valid image URL or reply to an image.");

    let response;
    try {
      response = await axios.get(imageURL, { responseType: "stream" });
    } catch {
      return message.reply("❌ Error: Failed to download the image.");
    }

    if (!response.headers["content-type"].includes("image")) {
      return message.reply("❌ Error: The URL does not point to a valid image.");
    }

    response.data.path = "avatar.jpg";

    api.changeAvatar(response.data, caption, expirationAfter ? expirationAfter * 1000 : null, (err) => {
      if (err) return message.reply(`❌ Failed to change avatar: ${err.message || err}`);
      return message.reply("✅ Bot avatar updated successfully.");
    });
  }
};
