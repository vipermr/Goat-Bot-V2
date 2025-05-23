const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ckban",
    version: "1.5",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    shortDescription: "Check if media is allowed",
    longDescription: "Checks if the current thread is banned from sending attachments.",
    category: "tools",
    guide: {
      en: "{p}ckban"
    }
  },

  onStart: async function ({ api, event }) {
    const folderPath = path.join(__dirname, "NAFIJ");
    const filePath = path.join(folderPath, "test.txt");

    try {
      const loadingMsg = await api.sendMessage("⏳ Checking media permissions...", event.threadID);

      // Ensure the folder exists
      await fs.ensureDir(folderPath);

      // Write test file
      await fs.writeFile(filePath, "Check");

      // Try sending the file
      api.sendMessage({
        body: "",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, async (err, info) => {
        if (err) throw err;

        // Delete the test message from chat
        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 3000); // 3 seconds delay

        // Edit loading message to result
        await api.editMessage("✅ This thread is *not* media banned. Attachments are allowed.", loadingMsg.messageID, event.threadID);

        // Remove test file
        fs.unlinkSync(filePath);
      });

    } catch (err) {
      const isMediaBanError = err.message?.includes("not allowed") || err.message?.includes("Cannot send attachment");

      if (isMediaBanError) {
        await api.sendMessage("❌ This thread *is* media banned. Cannot send attachments here.", event.threadID);
      } else {
        console.error("Unexpected error in ckban:", err);
        await api.sendMessage("⚠ An unexpected error occurred while checking media permission.", event.threadID);
      }

      // Clean up if file exists
      if (await fs.pathExists(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
};
