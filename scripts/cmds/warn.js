const fs = require("fs-extra");

module.exports = {
  config: {
    name: "warnpro",
    version: "2.1",
    author: "Deku",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Manage user warnings" },
    longDescription: { en: "Manage user warnings in group" },
    category: "owner",
    guide: {
      en:
        "{pn} [uid/reply/tag] <reason>: warn user\n" +
        "{pn} list: show warning list\n" +
        "{pn} remove <uid/reply/tag> [index]: remove warning\n" +
        "{pn} remove all: remove all warnings\n" +
        "{pn} unwarn <uid/reply/tag> [index]: same as remove"
    }
  },

  langs: {
    en: {
      noPermission: "You do not have permission to use this command.",
      noPermission4: "You need to be an admin to warn users.",
      invalidUid4: "Please reply to a message or mention someone to warn/unwarn.",
      userNotInGroup: "User is no longer in the group.",
      noPermission5: "Cannot remove user from group. Please check my permissions.",
      warnSuccess: "Warned {name} ({uid})\nReason: {reason}\nTime: {time}\nTotal warnings: {total}\n\nAfter 3 warnings, user will be removed from group.\n\nUse: {prefix}warnpro list",
      warnSuccess2: "Warned {name} ({uid})\nReason: {reason}\nTime: {time}\nTotal warnings: {total}\n\n{left} warning(s) left before removal.",
      noData: "No one has been warned in this group.",
      listWarn: "List of warnings in this group:\n\n{list}",
      noUserData: "User has no warnings.",
      removeSuccess: "Removed warning of {name} ({uid})\nReason: {reason}",
      invalidIndex: "Invalid warning index.",
      clearSuccess: "Cleared all warnings of user {name} ({uid})",
      clearAllSuccess: "Successfully cleared all warnings in this group.",
      guide: "Usage guide:\n{pn} [uid/reply] <reason>: warn user\n{pn} list: show warning list\n{pn} remove <uid/reply> [index]: remove warning\n{pn} remove all: remove all warnings\n{pn} unwarn <uid/reply> [index]: same as remove"
    }
  },

  onStart: async function ({ message, event, args, usersData, threadsData, role, getLang, prefix, api }) {
    const { threadID, senderID } = event;
    let warnList = (await threadsData.get(threadID, "data.warn")) || [];

    const safeGetName = async uid => {
      if (!uid || isNaN(uid)) return "Unknown";
      return await usersData.getName(Number(uid)).catch(() => "Unknown");
    };

    if (args.length === 1 && args[0] === "guide") {
      return message.reply(getLang("guide").replace(/{pn}/g, prefix));
    }

    switch (args[0]) {
      case "list": {
        if (warnList.length === 0)
          return message.reply(getLang("noData"));

        let msg = "";
        let index = 1;
        for (const item of warnList) {
          const name = await safeGetName(item.uid);
          for (const warn of item.list) {
            const warnByName = await safeGetName(warn.warnBy);
            msg += `${index++}. ${name} (${item.uid})\n- Reason: ${warn.reason}\n- Time: ${warn.dateTime}\n- By: ${warnByName}\n\n`;
          }
        }
        return message.reply(getLang("listWarn").replace("{list}", msg));
      }

      case "remove":
      case "unwarn": {
        if (role < 1) return message.reply(getLang("noPermission"));

        if (args[1] === "all") {
          warnList = [];
          await threadsData.set(threadID, warnList, "data.warn");
          return message.reply(getLang("clearAllSuccess"));
        }

        let uid, index;
        if (event.messageReply) {
          uid = event.messageReply.senderID;
          index = args[1] ? parseInt(args[1]) - 1 : null;
        } else if (Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
          index = args[2] ? parseInt(args[2]) - 1 : null;
        } else {
          uid = args[1];
          index = args[2] ? parseInt(args[2]) - 1 : null;
        }

        if (!uid || isNaN(uid)) return message.reply(getLang("invalidUid4"));

        const data = warnList.find(i => i.uid == uid);
        if (!data) return message.reply(getLang("noUserData"));

        if (index == null) {
          const name = await safeGetName(uid);
          warnList = warnList.filter(i => i.uid != uid);
          await threadsData.set(threadID, warnList, "data.warn");
          return message.reply(getLang("clearSuccess").replace("{name}", name).replace("{uid}", uid));
        }

        if (index < 0 || index >= data.list.length)
          return message.reply(getLang("invalidIndex"));

        const warn = data.list.splice(index, 1)[0];
        if (data.list.length === 0)
          warnList = warnList.filter(i => i.uid != uid);

        await threadsData.set(threadID, warnList, "data.warn");
        const name = await safeGetName(uid);
        return message.reply(
          getLang("removeSuccess")
            .replace("{name}", name)
            .replace("{uid}", uid)
            .replace("{reason}", warn.reason)
        );
      }

      default: {
        if (role < 1) return message.reply(getLang("noPermission4"));

        let uid, reason;
        if (event.messageReply) {
          uid = event.messageReply.senderID;
          reason = args.join(" ").trim();
        } else if (Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
          reason = args.join(" ").replace(event.mentions[uid], "").trim();
        } else if (args[0]) {
          uid = args[0];
          reason = args.slice(1).join(" ").trim();
        } else {
          return message.reply(getLang("invalidUid4"));
        }

        if (!uid || isNaN(uid)) return message.reply(getLang("invalidUid4"));
        if (!reason) reason = "No reason";

        if (uid === "100058371606434")
          return message.reply("❌ You cannot warn this special user.");

        const threadInfo = await api.getThreadInfo(threadID);
        const isTargetAdmin = threadInfo.adminIDs.some(item => item.id == uid);
        if (isTargetAdmin)
          return message.reply("❌ You cannot warn a group admin.");

        let dataWarnOfUser = warnList.find(item => item.uid == uid);
        const dateTime = new Date().toLocaleString("en-GB", { timeZone: "Asia/Ho_Chi_Minh" });

        if (!dataWarnOfUser) {
          dataWarnOfUser = {
            uid,
            list: [{ reason, dateTime, warnBy: senderID }]
          };
          warnList.push(dataWarnOfUser);
        } else {
          dataWarnOfUser.list.push({ reason, dateTime, warnBy: senderID });
        }

        await threadsData.set(threadID, warnList, "data.warn");
        const times = dataWarnOfUser.list.length;
        const userName = await safeGetName(uid);

        if (times >= 3) {
          message.reply(
            getLang("warnSuccess")
              .replace("{name}", userName)
              .replace("{uid}", uid)
              .replace("{reason}", reason)
              .replace("{time}", dateTime)
              .replace("{total}", times)
              .replace("{prefix}", prefix),
            () => {
              api.removeUserFromGroup(uid, threadID, async (err) => {
                if (err) {
                  const members = await threadsData.get(threadID, "members");
                  if (members.find(item => item.userID == uid)?.inGroup)
                    return message.reply(getLang("userNotInGroup", userName));
                  else
                    return message.reply(getLang("noPermission5"));
                }
              });
            }
          );
        } else {
          message.reply(
            getLang("warnSuccess2")
              .replace("{name}", userName)
              .replace("{uid}", uid)
              .replace("{reason}", reason)
              .replace("{time}", dateTime)
              .replace("{total}", times)
              .replace("{left}", 3 - times)
          );
        }
      }
    }
  }
};