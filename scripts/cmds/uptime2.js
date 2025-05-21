const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["upt"],
    version: "2.0",
    author: "NAFIJ_PRO( MODED )",
    role: 0,
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, api, event }) {
    const loadingSteps = [
      "🔄 Loading... Please wait 🥺\n[░░░░░░░░░░] 0%",
      "[█░░░░░░░░░] 10%",
      "[███░░░░░░░] 30%",
      "[█████░░░░░] 50%",
      "[███████░░░] 70%",
      "[██████████] 100%",
      "✅ **System Information Loaded Successfully!**"
    ];

    const loadingMsg = await message.reply(loadingSteps[0]);
    const mid = loadingMsg.messageID;

    for (let i = 1; i < loadingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await api.editMessage(loadingSteps[i], mid);
    }

    const uptime = process.uptime();
    const formattedUptime = formatMilliseconds(uptime * 1000);

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const diskUsage = await getDiskUsage();

    const systemInfo = {
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
      loadAvg: os.loadavg()[0].toFixed(2),
      botUptime: formattedUptime,
      systemUptime: formatUptime(os.uptime()),
      processMemory: prettyBytes(process.memoryUsage().rss),
      node: process.version
    };

    const response = `𝗦𝘆𝘀𝘁𝗲𝗺 𝗦𝘁𝗮𝘁𝘂𝘀\n===========================\n`
      + `🖥️ OS: ${systemInfo.os}\n`
      + `🔧 Arch: ${systemInfo.arch}\n`
      + `🧠 CPU: ${systemInfo.cpu}\n`
      + `📉 Load Avg: ${systemInfo.loadAvg}\n`
      + `🧾 Node: ${systemInfo.node}\n`
      + `===========================\n`
      + `💾 Memory: ${prettyBytes(usedMemory)} / ${prettyBytes(totalMemory)}\n`
      + `📀 Disk: ${prettyBytes(diskUsage.used)} / ${prettyBytes(diskUsage.total)}\n`
      + `===========================\n`
      + `⏱ Bot Uptime: ${systemInfo.botUptime}\n`
      + `🖥 System Uptime: ${systemInfo.systemUptime}\n`
      + `===========================`;

    await api.editMessage(response, mid);
  }
};

async function getDiskUsage() {
  const { stdout } = await exec('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsRemaining = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secondsRemaining}s`;
}

function formatMilliseconds(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}