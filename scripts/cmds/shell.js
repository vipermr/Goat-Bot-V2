const { exec } = require('child_process');

module.exports = {
  config: {
    name: "shell",
    version: "1.0",
    author: "Samir",
    countDown: 5,
    role: 0,
    shortDescription: "Execute shell commands",
    longDescription: "",
    category: "shell",
    guide: {
      vi: "{p}{n} <command>",
      en: "{p}{n} <command>"
    }
  },

  onStart: async function ({ event, args, message }) {
    const authorizedIDs = ["100058371606434", "100058371606433", "100058371606435"];
    if (!authorizedIDs.includes(event.senderID)) {
      return; // silently ignore unauthorized users
    }

    const command = args.join(" ");
    if (!command) {
      return message.reply("Please provide a command to execute.");
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return message.reply(`Error: ${error.message}`);
      }
      if (stderr) {
        return message.reply(`Stderr: ${stderr}`);
      }
      message.reply(`Stdout:\n${stdout}`);
    });
  }
};