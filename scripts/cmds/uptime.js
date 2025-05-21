module.exports = {
  config: {
    name: "up",
    aliases: ["upt", "uptime"],
    version: "2.1",
    author: "NAFIJ_PRO( MODED )",
    role: 0,
    shortDescription: {
      en: "Display bot uptime"
    },
    longDescription: {
      en: "Shows how long the bot has been online including days, hours, minutes, and seconds."
    },
    category: "system",
    guide: {
      en: "{pn} — Show how long the bot has been running."
    }
  },

  onStart: async function ({ api, event }) {
    const waitMsg = await api.sendMessage("⏳ Please wait, fetching uptime...", event.threadID);

    setTimeout(async () => {
      const uptime = process.uptime();
      const seconds = Math.floor(uptime % 60);
      const minutes = Math.floor((uptime / 60) % 60);
      const hours = Math.floor((uptime / 3600) % 24);
      const days = Math.floor(uptime / 86400);

      const uptimeString =
        `✅ **Uptime fetched successfully!**\n\n` +
        `╭─[ 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 ]─╮\n` +
        `│ 🗓 Days   : ${days}\n` +
        `│ ⏰ Hours  : ${hours}\n` +
        `│ ⏳ Minutes: ${minutes}\n` +
        `│ ⏲️ Seconds: ${seconds}\n` +
        `╰──────────────────╯\n` +
        `🤖 Powered by: NAFIJ_PRO_✅ & MEHERAJ_🌠`;

      api.editMessage(uptimeString, waitMsg.messageID, event.threadID);
    }, 2000); // Delay 2 seconds for the loading effect
  }
};