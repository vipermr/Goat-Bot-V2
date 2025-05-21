module.exports = {
  config: {
    name: "topbalance",
    version: "1.0",
    author: "NAFIJ_PRO( MODED )",
    role: 0,
    shortDescription: {
      en: "Top 10 Richest users"
    },
    longDescription: {
      en: "This module displays the top 10 richest users based on their money points."
    },
    category: "economy",
    guide: {
      en: "Use `{pn}` to see the top 10 richest users."
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    const allUsers = await usersData.getAll();

    // Filter out users with no money points
    const usersWithMoney = allUsers.filter(user => user.money > 0);

    if (usersWithMoney.length < 1) {
      return message.reply("No users with money points found.");
    }

    // Sort users by money descending
    const topBalance = usersWithMoney.sort((a, b) => b.money - a.money).slice(0, 10);

    const medals = ["🥇", "🥈", "🥉"];
    const messageLines = topBalance.map((user, index) => {
      const emoji = medals[index] || `🏅`;
      return `${emoji} ${index + 1}. ${user.name} — 💰 ${user.money}$`;
    });

    const messageText = `🏆 Top 10 Richest Users 🏆\n\n${messageLines.join('\n')}`;
    message.reply(messageText);
  }
};