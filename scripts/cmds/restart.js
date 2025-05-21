const fs = require("fs-extra");

module.exports = {
  config: {
    name: "restart",
    version: "1.2",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 2,
    description: "Restart the bot",
    category: "Owner",
    guide: {
      en: "{pn}: Restart the bot"
    }
  },

  onLoad: function ({ api }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
      const seconds = ((Date.now() - time) / 1000).toFixed(1);
      api.sendMessage(
        `✅ | BOT HAS SUCCESSFULLY REBOOTED!\n⚙️ POWERED BY NAFIJ_PRO_✅ AND MEHERAJ 🌠\n⏰ | Time taken: ${seconds}s`,
        tid
      );
      fs.unlinkSync(pathFile);
    }
  },

  onStart: async function ({ message, event }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
    await message.reply("🔄 | 𝚁𝙴𝚂𝚃𝙰𝚁𝚃𝙸𝙽𝙶 𝙱𝙾𝚃...");
    process.exit(2);
  }
};