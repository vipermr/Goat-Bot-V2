const { getTime } = global.utils;

module.exports = {
  config: {
    name: "thread",
    version: "1.5",
    author: "NAFIJ_PRO( MODED )",
    countDown: 5,
    role: 0,
    description: "Manage group chat in bot system",
    category: "system",
    guide: {
      en: "{pn} [find | -f | search | -s] <name>: search group chat by name"
        + "\n{pn} [find | -f | search | -s] [-j | joined] <name>: search joined group chat by name"
        + "\n{pn} [ban | -b] [<tid> | leave blank] <reason>: ban group by ID or current group"
        + "\nExample:\n{pn} ban 123456 spam\n{pn} ban abusing bot"
        + "\n\n{pn} unban [<tid> | leave blank]: unban group by ID or current group"
        + "\nExample:\n{pn} unban 123456\n{pn} unban"
    }
  },

  langs: {
    en: {
      noPermission: "You don't have permission to use this feature",
      found: "🔎 Found %1 group(s) matching \"%2\":\n%3",
      notFound: "❌ No group found matching keyword: \"%1\"",
      hasBanned: "Group [%1 | %2] is already banned:\n» Reason: %3\n» Time: %4",
      banned: "Group [%1 | %2] has been banned.\n» Reason: %3\n» Time: %4",
      notBanned: "Group [%1 | %2] is not banned.",
      unbanned: "Group [%1 | %2] has been unbanned.",
      missingReason: "Ban reason cannot be empty.",
      info: "» Box ID: %1\n» Name: %2\n» Created: %3\n» Total Members: %4\n» Male: %5\n» Female: %6\n» Total Messages: %7%8"
    }
  },

  onStart: async function ({ args, threadsData, message, role, event, getLang }) {
    const type = args[0];

    switch (type) {
      case "find":
      case "search":
      case "-f":
      case "-s": {
        if (role < 2)
          return message.reply(getLang("noPermission"));

        let allThread = await threadsData.getAll();
        let keyword = args.slice(1).join(" ");
        if (['-j', '-join'].includes(args[1])) {
          allThread = allThread.filter(thread => thread.members.some(member => member.userID == global.GoatBot.botID && member.inGroup));
          keyword = args.slice(2).join(" ");
        }

        const result = allThread.filter(item => item.threadID.length > 15 && (item.threadName || "").toLowerCase().includes(keyword.toLowerCase()));
        const resultText = result.reduce((i, thread) => i += `\n╭Name: ${thread.threadName}\n╰ID: ${thread.threadID}`, "");
        return message.reply(result.length > 0 ? getLang("found", result.length, keyword, resultText) : getLang("notFound", keyword));
      }

      case "ban":
      case "-b": {
        if (role < 2)
          return message.reply(getLang("noPermission"));

        let tid, reason;
        if (!isNaN(args[1])) {
          tid = args[1];
          reason = args.slice(2).join(" ");
        } else {
          tid = event.threadID;
          reason = args.slice(1).join(" ");
        }

        if (!tid || !reason)
          return message.reply(getLang("missingReason"));

        reason = reason.trim();
        const threadData = await threadsData.get(tid);
        const name = threadData.threadName;
        if (threadData.banned.status)
          return message.reply(getLang("hasBanned", tid, name, threadData.banned.reason, threadData.banned.date));

        const time = getTime("DD/MM/YYYY HH:mm:ss");
        await threadsData.set(tid, {
          banned: {
            status: true,
            reason,
            date: time
          }
        });
        return message.reply(getLang("banned", tid, name, reason, time));
      }

      case "unban":
      case "-u": {
        if (role < 2)
          return message.reply(getLang("noPermission"));

        const tid = !isNaN(args[1]) ? args[1] : event.threadID;
        const threadData = await threadsData.get(tid);
        const name = threadData.threadName;

        if (!threadData.banned.status)
          return message.reply(getLang("notBanned", tid, name));

        await threadsData.set(tid, { banned: {} });
        return message.reply(getLang("unbanned", tid, name));
      }

      case "info":
      case "-i": {
        const tid = !isNaN(args[1]) ? args[1] : event.threadID;
        const threadData = await threadsData.get(tid);
        const createdDate = getTime(threadData.createdAt, "DD/MM/YYYY HH:mm:ss");
        const members = Object.values(threadData.members).filter(m => m.inGroup);
        const males = members.filter(m => m.gender === "MALE").length;
        const females = members.filter(m => m.gender === "FEMALE").length;
        const totalMessages = members.reduce((i, m) => i + m.count, 0);
        const banInfo = threadData.banned.status
          ? `\n- Banned: true\n- Reason: ${threadData.banned.reason}\n- Time: ${threadData.banned.date}`
          : "";

        const msg = getLang("info", tid, threadData.threadName, createdDate, members.length, males, females, totalMessages, banInfo);
        return message.reply(msg);
      }

      default:
        return message.SyntaxError();
    }
  }
};