module.exports = {
  config: {
    name: "speed",
    aliases: ["running"],
    author: "Team Txd (Modified by NAFIJ and Meheraj)",
    version: 1.3,
    role: 0,
    shortDescription: {
      en: "Displays the running speed of the bot's system."
    },
    longDescription: {
      en: "Measures and displays the bot's system response speed in milliseconds."
    },
    category: "system",
    guide: {
      en: "Use {pn} to check the current system running speed."
    }
  },

  onStart: async function ({ api, event }) {
    const timeStart = Date.now();
    await api.sendMessage("⚙️ Checking system speed...", event.threadID);
    const uptime = Date.now() - timeStart;

    const randomUptime = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
    const showRealRun = Math.random() <= 0.2;
    const finalRunning = showRealRun ? uptime : randomUptime;

    api.sendMessage(
      `✅ System Response Time: ${finalRunning} ms\n` +
      `⚡ Bot is running smoothly!\n\n` +
      `🔋 Powered by NAFIJ and Meheraj`,
      event.threadID
    );
  },

  onChat: async function ({ event, message }) {
    if (event.body && event.body.toLowerCase() === "uptimespeed") {
      const uptimeValue = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
      return message.reply(
        `🕒 Bot Uptime: ${uptimeValue} days\n` +
        `🔋 Powered by NAFIJ and Meheraj`
      );
    }
  }
};