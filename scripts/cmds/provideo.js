const fs = require("fs");
const path = require("path");
const axios = require("axios");
const drive = require("./NAFIJ/PRO/driveHelper.js");

const storagePath = path.join(__dirname, "NAFIJ", "PRO", "provideo-storage.json");

function loadStorage() {
  if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, "[]");
  return JSON.parse(fs.readFileSync(storagePath));
}

function saveStorage(data) {
  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "provideo",
    version: "1.0",
    author: "NAFIJ",
    role: 0,
    shortDescription: "Send or save videos",
    longDescription: "Send a random video or add a video from reply or Facebook link.",
    category: "media",
    guide: "{pn} [add | add <fb-link>]"
  },

  onStart: async function ({ message, args, event }) {
    const storage = loadStorage();

    // Add video from reply or link
    if (args[0] === "add") {
      const reply = event.messageReply;

      if (reply && reply.attachments[0]?.type === "video") {
        const videoUrl = reply.attachments[0].url;
        const fileName = `video_${Date.now()}.mp4`;
        const localPath = path.join(__dirname, "NAFIJ", "PRO", fileName);

        // Download video
        const res = await axios.get(videoUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(localPath);
        res.data.pipe(writer);
        await new Promise(resolve => writer.on("finish", resolve));

        // Upload to drive and save ID
        const fileId = await drive.uploadFile(localPath, fileName);
        storage.push({ fileId, name: fileName });
        saveStorage(storage);
        fs.unlinkSync(localPath);

        return message.reply("✅ Video added successfully to storage.");
      }

      // Add via link
      if (args[1]?.startsWith("https://www.facebook.com/")) {
        const fbLink = args[1];
        storage.push({ fbLink });
        saveStorage(storage);
        return message.reply("✅ Facebook video link added to storage.");
      }

      return message.reply("⚠️ Please reply to a video or provide a Facebook link.");
    }

    // Send a random video
    if (storage.length === 0) return message.reply("❌ No videos in storage.");

    const rand = storage[Math.floor(Math.random() * storage.length)];

    if (rand.fileId) {
      const localPath = await drive.downloadFile(rand.fileId);
      return message.reply({
        body: "🎬 Here's a random video for you!",
        attachment: fs.createReadStream(localPath)
      });
    }

    if (rand.fbLink) {
      return message.reply(`🎥 Facebook video link: ${rand.fbLink}`);
    }

    message.reply("⚠️ Could not find a valid video.");
  }
};
