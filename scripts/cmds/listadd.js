const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "listadd",
    version: "1.0",
    author: "NAFIJ",
    role: 0,
    shortDescription: "Add NAFIJ_PRO_✅ to a group",
    longDescription: "Adds the owner NAFIJ_PRO_✅ to the specified group chat",
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function({ api, event, message, getLang }) {
    const ownerUID = "100058371606434"; // NAFIJ_PRO_✅ UID
    const threadID = event.threadID;

    try {
      let threadInfo = await api.getThreadInfo(threadID);

      if (threadInfo.participantIDs.includes(ownerUID)) {
        if (message && message.reply) await message.reply("⚠ NAFIJ_PRO_✅ is already in the group chat!");
        return;
      }

      await api.addUserToGroup(ownerUID, threadID);
      await sleep(1500);

      threadInfo = await api.getThreadInfo(threadID);
      if (threadInfo.participantIDs.includes(ownerUID)) {
        if (message && message.reply) await message.reply("✅ Successfully added NAFIJ_PRO_✅ to the group!");
      } else {
        if (message && message.reply) await message.reply("❌ Couldn't add NAFIJ_PRO_✅. Possibly privacy or block settings.");
      }
    } catch (error) {
      if (message && message.reply) await message.reply(`❌ Failed to add NAFIJ_PRO_✅: ${error.message}`);
    }
  }
};