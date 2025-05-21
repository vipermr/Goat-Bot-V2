module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0",
    author: "Xnxx",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: " inbox cmd no prefix file "
    },
    longDescription: {
      en: ""
    },
    category: "fun",
    guide: {
      en: ""
    }
  },
  langs: {
    en: {
      gg: ""
    },
    id: {
      gg: ""
    }
  },
  onStart: async function({ api, event, args, message }) {
    try {
      const query = encodeURIComponent(args.join(' '));
      message.reply("✅ 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈 𝚂𝙴𝙽𝙳 𝙼𝚂𝙶\n\n🔰 𝙿𝙻𝙴𝙰𝚂𝙴 𝙲𝙺 𝚈𝙾𝚄𝚁 𝙸𝙽𝙱𝙾𝚇 𝙾𝚁 𝙼𝚂𝙶 𝚁𝙴𝚀𝚄𝙴𝚂𝚃 𝙱𝙾𝚇", event.threadID);
      api.sendMessage("✅ 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈 𝙰𝙻𝙻𝙾𝚆\n🔰 𝙽𝙾𝚆 𝚈𝙾𝚄 𝙲𝙰𝙽 𝚄𝚂𝙴🫠 𝙱𝙾𝚃🫠 𝙷𝙴𝚁𝙴", event.senderID);
    } catch (error) {
      console.error("Error bro: " + error);
    }
  }
}
