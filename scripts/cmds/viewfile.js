const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "viewfile",
    aliases: ["vf"],
    version: "3.0",
    author: "NAFIJ_PRO( MODED )",
    countDown: 3,
    role: 2,
    category: "tools",
    description: "View or list command .js/.json files",
    guide: {
      en: "{pn} <commandName>\n{pn} all json\n{pn} all js"
    }
  },

  onStart: async function ({ args, message }) {
    if (!args[0]) return message.reply("Please provide a file name or use 'all json' or 'all js'.");

    const target = args.join(" ").toLowerCase();
    const directory = __dirname;

    if (target === "all json" || target === "all .json") {
      const jsonFiles = fs.readdirSync(directory).filter(file => file.endsWith(".json"));
      if (jsonFiles.length === 0) return message.reply("No JSON files found.");
      const jsonList = jsonFiles.map((f, i) => `${i + 1}. ${f}`).join("\n");
      return message.reply(`JSON files found:\n\n${jsonList}`);
    }

    if (target === "all js" || target === "all .js") {
      const jsFiles = fs.readdirSync(directory).filter(file => file.endsWith(".js") && file !== "viewfile.js");
      if (jsFiles.length === 0) return message.reply("No JS files found.");
      const jsList = jsFiles.map((f, i) => `${i + 1}. ${f}`).join("\n");
      return message.reply(`JS files found:\n\n${jsList}`);
    }

    const fileName = target;
    const jsFile = path.join(directory, `${fileName}.js`);
    const jsonFile = path.join(directory, `${fileName}.json`);

    if (fs.existsSync(jsFile)) {
      return message.reply({
        body: `Here is the "${fileName}.js" file:`,
        attachment: fs.createReadStream(jsFile)
      });
    }

    if (fs.existsSync(jsonFile)) {
      return message.reply({
        body: `Here is the "${fileName}.json" file:`,
        attachment: fs.createReadStream(jsonFile)
      });
    }

    return message.reply(`No file found for "${fileName}".`);
  }
};