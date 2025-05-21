module.exports = {
  config: {
    name: "de",
    aliases: ["del"],
    author: "ArYan",
role: 2,
    category: "system"
  },

  onStart: async function ({ api, event, args }) {
    const fs = require('fs');
    const path = require('path');

    const fileName = args[0];

    if (!fileName) {
      api.sendMessage("Please provide a file name to delete.", event.threadID);
      return;
    }

    const filePath = path.join(__dirname, fileName);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        api.sendMessage(`Ki vulval type koros😾 ${fileName}. Thik koira lekh😼`, event.threadID);
        return;
      }
      api.sendMessage(`✅ Hey Pro 𝚈𝙾𝚄𝚁  𝙲𝙼𝙳  ➪ ( ${fileName} )  Deleted 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈`, event.threadID);
    });
  }
};
