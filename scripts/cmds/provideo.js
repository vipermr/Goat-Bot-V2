const fs = require('fs');
const path = require('path');
const { uploadFile, downloadFile } = require('./driveHelper');

const videoDBPath = path.join(__dirname, 'videos.json');

module.exports = {
  config: {
    name: "provideo",
    version: "1.0",
    author: "NAFIJ",
    role: 0,
    shortDescription: "Send or add videos",
    longDescription: "Send a random video or add one from reply or link",
    category: "media",
    guide: "{pn} [add | add <link> | nothing]"
  },

  onStart: async function ({ event, message, args, api }) {
    const { threadID, messageID, messageReply } = event;

    if (!fs.existsSync(videoDBPath)) {
      fs.writeFileSync(videoDBPath, '[]', 'utf-8');
    }

    let videoList = JSON.parse(fs.readFileSync(videoDBPath));

    // ADD MODE
    if (args[0] === "add") {
      // Case 1: Add FB link
      if (args[1] && args[1].startsWith("http")) {
        videoList.push({ type: "link", url: args[1] });
        fs.writeFileSync(videoDBPath, JSON.stringify(videoList, null, 2));
        return message.reply("✅ Facebook video link added.");
      }

      // Case 2: Add replied video
      if (messageReply?.attachments?.[0]?.type === "video") {
        const videoUrl = messageReply.attachments[0].url;
        const localPath = path.join(__dirname, `temp_${Date.now()}.mp4`);

        const downloader = require("node-fetch");
        const res = await downloader(videoUrl);
        const fileStream = fs.createWriteStream(localPath);
        await new Promise((resolve) => {
          res.body.pipe(fileStream);
          res.body.on("end", resolve);
        });

        const fileId = await uploadFile(localPath);
        fs.unlinkSync(localPath);
        videoList.push({ type: "drive", id: fileId });
        fs.writeFileSync(videoDBPath, JSON.stringify(videoList, null, 2));
        return message.reply("✅ Video uploaded to Drive and added.");
      }

      return message.reply("Please reply to a video or provide a Facebook video link.");
    }

    // PLAY MODE
    if (videoList.length === 0) return message.reply("No videos saved.");

    const random = videoList[Math.floor(Math.random() * videoList.length)];

    if (random.type === "link") {
      return message.reply(`Here’s a saved video link:\n${random.url}`);
    }

    if (random.type === "drive") {
      const tempPath = path.join(__dirname, `video_${Date.now()}.mp4`);
      await downloadFile(random.id, tempPath);
      return message.reply({
        body: "Here’s a random video from Drive:",
        attachment: fs.createReadStream(tempPath)
      }, () => fs.unlinkSync(tempPath));
    }
  }
};
