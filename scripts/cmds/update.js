const axios = require("axios");
const fs = require("fs-extra");
const execSync = require("child_process").execSync;
const dirBootLogTemp = `${__dirname}/tmp/rebootUpdated.txt`;

module.exports = {
  config: {
    name: "update",
    version: "1.5",
    author: "NAFIJ_PRO( MODED )",
    role: 2,
    description: {
      en: "Check for and install updates for the chatbot."
    },
    category: "owner",
    guide: {
      en: "{pn} — Check and update GoatBot to the latest version."
    }
  },

  langs: {
    en: {
      noUpdates: "✅ | You're using the latest version of GoatBot V2 (v%1).",
      updatePrompt: "✨ | You're on version %1. A new version %2 is available!\n\n" +
        "⬆️ | The following files will be updated:\n%3%4\n\n" +
        "ℹ️ | View details: https://github.com/ntkhang03/Goat-Bot-V2/commits/main\n" +
        "💡 | React to this message to confirm the update.",
      fileWillDelete: "\n🗑️ | The following files/folders will be removed:\n%1",
      andMore: " ...and %1 more files",
      updateConfirmed: "⚙️ | Update confirmed! Preparing to update...",
      updateComplete: "✅ | Update completed! Do you want to restart the bot now? (Reply with \"yes\" or \"y\" to confirm.)",
      updateTooFast: "⏳ | The last update was just %1 min %2 sec ago. Please wait %3 min %4 sec before updating again.",
      botWillRestart: "🔄 | Restarting bot now!"
    }
  },

  onLoad: async function ({ api }) {
    if (fs.existsSync(dirBootLogTemp)) {
      const threadID = fs.readFileSync(dirBootLogTemp, "utf-8");
      fs.removeSync(dirBootLogTemp);
      api.sendMessage("✅ Bot restarted successfully!", threadID);
    }
  },

  onStart: async function ({ message, getLang, commandName, event }) {
    const { data: { version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
    const { data: versions } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/versions.json");

    const currentVersion = require("../../package.json").version;
    if (compareVersion(version, currentVersion) < 1)
      return message.reply(getLang("noUpdates", currentVersion));

    const newVersions = versions.slice(versions.findIndex(v => v.version == currentVersion) + 1);

    let fileWillUpdate = [...new Set(newVersions.map(v => Object.keys(v.files || {})).flat())]
      .sort().filter(f => f?.length);
    const totalUpdate = fileWillUpdate.length;
    fileWillUpdate = fileWillUpdate.slice(0, 10).map(file => ` - ${file}`).join("\n");

    let fileWillDelete = [...new Set(newVersions.map(v => Object.keys(v.deleteFiles || {}).flat()))]
      .sort().filter(f => f?.length);
    const totalDelete = fileWillDelete.length;
    fileWillDelete = fileWillDelete.slice(0, 10).map(file => ` - ${file}`).join("\n");

    message.reply(
      getLang(
        "updatePrompt",
        currentVersion,
        version,
        fileWillUpdate + (totalUpdate > 10 ? "\n" + getLang("andMore", totalUpdate - 10) : ""),
        totalDelete > 0 ? "\n" + getLang(
          "fileWillDelete",
          fileWillDelete + (totalDelete > 10 ? "\n" + getLang("andMore", totalDelete - 10) : "")
        ) : ""
      ),
      (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReaction.set(info.messageID, {
          messageID: info.messageID,
          threadID: info.threadID,
          authorID: event.senderID,
          commandName
        });
      });
  },

  onReaction: async function ({ message, getLang, Reaction, event, commandName }) {
    if (event.userID != Reaction.authorID) return;

    const { data: lastCommit } = await axios.get('https://api.github.com/repos/ntkhang03/Goat-Bot-V2/commits/main');
    const lastCommitDate = new Date(lastCommit.commit.committer.date);

    if (new Date().getTime() - lastCommitDate.getTime() < 5 * 60 * 1000) {
      const minutes = Math.floor((new Date().getTime() - lastCommitDate.getTime()) / 1000 / 60);
      const seconds = Math.floor((new Date().getTime() - lastCommitDate.getTime()) / 1000 % 60);
      const minutesCooldown = Math.floor((5 * 60 * 1000 - (new Date().getTime() - lastCommitDate.getTime())) / 1000 / 60);
      const secondsCooldown = Math.floor((5 * 60 * 1000 - (new Date().getTime() - lastCommitDate.getTime())) / 1000 % 60);
      return message.reply(getLang("updateTooFast", minutes, seconds, minutesCooldown, secondsCooldown));
    }

    await message.reply(getLang("updateConfirmed"));
    execSync("node update", { stdio: "inherit" });
    fs.writeFileSync(dirBootLogTemp, event.threadID);

    message.reply(getLang("updateComplete"), (err, info) => {
      if (err) return console.error(err);
      global.GoatBot.onReply.set(info.messageID, {
        messageID: info.messageID,
        threadID: info.threadID,
        authorID: event.senderID,
        commandName
      });
    });
  },

  onReply: async function ({ message, getLang, event }) {
    if (['yes', 'y'].includes(event.body?.toLowerCase())) {
      await message.reply(getLang("botWillRestart"));
      process.exit(2);
    }
  }
};

function compareVersion(version1, version2) {
  const v1 = version1.split(".");
  const v2 = version2.split(".");
  for (let i = 0; i < 3; i++) {
    if (parseInt(v1[i]) > parseInt(v2[i])) return 1;
    if (parseInt(v1[i]) < parseInt(v2[i])) return -1;
  }
  return 0;
}