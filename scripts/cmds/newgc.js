const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "newbox",
    aliases: ["newgc", "createbox"],
    version: "1.2",
    author: "Samir (Modified by NAFIJ_PRO)",
    countDown: 5,
    role: 2,
    shortDescription: "Create a new Messenger group",
    longDescription: "Create a Messenger group by mentioning or replying to someone",
    category: "owner",
    guide: {
      en: "{pn} @user | Group Name\n{pn} me @user | Group Name\n{pn} (reply with optional | Group Name)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { senderID, messageID, threadID, mentions, messageReply, body } = event;
    const GOD = global.GoatBot.config.GOD || [];
    const vipUser = global.GoatBot.config.vipUser || [];
    const adminBot = global.GoatBot.config.adminBot || [];
    const permissionUsers = [...GOD, ...vipUser, ...adminBot];

    if (!permissionUsers.includes(senderID)) {
      return api.sendMessage("❌ You are not a VIP user. Use /request to ask permission.", threadID, messageID);
    }

    const participants = [senderID];
    let groupName = "NAFIJ_PRO✅& MEHERAJ🌠";

    // Check for mentions
    const mentionedUsers = Object.keys(mentions);
    if (mentionedUsers.length > 0) {
      participants.push(...mentionedUsers);
    }

    // Check for replied user
    if (messageReply?.senderID && !participants.includes(messageReply.senderID)) {
      participants.push(messageReply.senderID);
    }

    // Auto-add bot if not present
    const botID = api.getCurrentUserID();
    if (!participants.includes(botID)) participants.push(botID);

    // Validate enough members
    if (participants.length < 3) {
      return api.sendMessage("⚠️ Please mention or reply to at least 1 person (Messenger requires minimum 3 members).", threadID, messageID);
    }

    // Extract group name from input
    if (body.includes("|")) {
      groupName = body.split("|").pop().trim();
    }

    // Create group
    api.createNewGroup(participants, groupName, async (err, newThreadID) => {
      if (err) return api.sendMessage("❌ Failed to create group.", threadID, messageID);
      api.sendMessage(`✅ Group '${groupName}' created successfully!`, threadID);

      // Set group image
      const imgURL = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/1747860161464.jpg";
      const imgPath = path.join(__dirname, "temp.jpg");
      try {
        const res = await axios.get(imgURL, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, res.data);
        api.changeGroupImage(fs.createReadStream(imgPath), newThreadID, () => fs.unlinkSync(imgPath));
      } catch (e) {
        console.log("⚠️ Could not set group image:", e.message);
      }
    });
  }
};