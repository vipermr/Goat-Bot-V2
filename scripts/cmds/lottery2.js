.cmd install const fs = require('fs');
const path = require('path');
const moment = require('moment');

const CONFIG = {
TICKET_PRICE: 1000000,
MAX_TICKETS_USER: 5,
MAX_TICKETS_TOTAL: 150,
DRAW_TIME: 18,
ADMIN_UIDS: ["100000000628", "1900000000278", "100058371606434"],
DATA_FILE: path.join(__dirname, 'lottery.json')
};

const EMOJI = {
TICKET: "🎟️", MONEY: "💰", JACKPOT: "🏆", ERROR: "❌", SUCCESS: "✅",
CLOCK: "⏰", BANK: "🏦", ADMIN: "👑", INFO: "ℹ️"
};

module.exports = {
config: {
name: "lottery",
version: "9.0",
author: "NAFIJ_PRO_✅",
shortDescription: `${EMOJI.TICKET} Million Dollar Lottery`,
longDescription: "Buy tickets for a chance to win millions!",
category: "Economy",
usages: "{pn} [buy/my/info/draw]"
},

onStart: async function ({ args, message, event, usersData }) {
const { senderID } = event;
const now = moment();
let data = { tickets: {}, ticketCount: 0, pool: 0, lastDraw: null, winner: null };

if (fs.existsSync(CONFIG.DATA_FILE)) {
data = JSON.parse(fs.readFileSync(CONFIG.DATA_FILE));
}

const drawTime = moment().set('hour', CONFIG.DRAW_TIME).set('minute', 0);
if (moment().isAfter(drawTime)) drawTime.add(1, 'day');
const drawTimeStr = drawTime.format("h:mm A");

if (args.length === 0 || args[0].toLowerCase() === "usage") {
return message.reply(
`╭─❑ LOTTERY COMMANDS ❑─ │\n├‣ buy <1-5> - Purchase tickets\n├‣ my - View your tickets\n├‣ info - Lottery status\n├‣ draw - Admin draw (6PM)\n│\n╰‣ 𝐀𝐝𝐦𝐢𝐧 👑 NAFIJ_PRO_✅\n fb.me/nafijrahaman2023`
);
}

const cmd = args[0].toLowerCase();

if (cmd === "buy") {
if (data.lastDraw && moment(data.lastDraw).isSame(now, 'day')) {
return message.reply(`${EMOJI.ERROR} Lottery already drawn today!`);
}

const amount = Math.min(Math.max(parseInt(args[1]) || 1, 1), CONFIG.MAX_TICKETS_USER);
const userTickets = data.tickets[senderID]?.length || 0;

if (userTickets + amount > CONFIG.MAX_TICKETS_USER) {
return message.reply(`${EMOJI.ERROR} Max ${CONFIG.MAX_TICKETS_USER} tickets/user!`);
}

if (data.ticketCount + amount > CONFIG.MAX_TICKETS_TOTAL) {
return message.reply(`${EMOJI.SUCCESS} All 150 tickets sold!\n${EMOJI.CLOCK} Draw tomorrow at 6PM`);
}

const cost = CONFIG.TICKET_PRICE * amount;
const userMoney = await usersData.get(senderID, "money") || 0;

if (userMoney < cost) {
return message.reply(`${EMOJI.ERROR} Need $${CONFIG.TICKET_PRICE.toLocaleString()} per ticket!`);
}

await usersData.set(senderID, { money: userMoney - cost });

const numbers = [];
for (let i = 0; i < amount; i++) {
const number = data.ticketCount + 1;
if (!data.tickets[senderID]) data.tickets[senderID] = [];
data.tickets[senderID].push(number);
numbers.push(number);
data.ticketCount++;
}

data.pool += cost;
fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(data, null, 2));

return message.reply(
`${EMOJI.SUCCESS} Purchased ${amount} ticket(s)\nNumbers: ${numbers.join(', ')}\nTotal: ${EMOJI.MONEY}${cost.toLocaleString()}`
);
}

if (cmd === "my") {
const userTickets = data.tickets[senderID] || [];
if (userTickets.length === 0) return message.reply(`${EMOJI.ERROR} You have no tickets`);
return message.reply(
`${EMOJI.TICKET} YOUR TICKETS\n${userTickets.join(', ')}\n${EMOJI.CLOCK} Draw: ${drawTimeStr}`
);
}

if (cmd === "info") {
return message.reply(
`${EMOJI.INFO} LOTTERY STATUS\n• Tickets sold: ${data.ticketCount}/150\n• Prize pool: ${EMOJI.MONEY}${data.pool.toLocaleString()}\n• Next draw: ${drawTimeStr}`
);
}

if (cmd === "draw") {
if (!CONFIG.ADMIN_UIDS.includes(senderID)) return message.reply(`${EMOJI.ADMIN} Admin only command!`);
if (data.lastDraw && moment(data.lastDraw).isSame(now, 'day')) return message.reply(`${EMOJI.ERROR} Lottery already drawn today!`);
if (now.hours() < CONFIG.DRAW_TIME) return message.reply(`${EMOJI.CLOCK} Draw available after 6PM!`);
if (data.ticketCount < CONFIG.MAX_TICKETS_TOTAL) return message.reply(`${EMOJI.ERROR} Need ${CONFIG.MAX_TICKETS_TOTAL} tickets sold before drawing!`);

const winnerNum = Math.floor(Math.random() * CONFIG.MAX_TICKETS_TOTAL) + 1;
let winnerID;

for (const [id, tickets] of Object.entries(data.tickets)) {
if (tickets.includes(winnerNum)) {
winnerID = id;
break;
}
}

const current = await usersData.get(winnerID, "money") || 0;
await usersData.set(winnerID, { money: current + data.pool });

data.lastDraw = new Date();
data.winner = { id: winnerID, ticket: winnerNum, prize: data.pool };
fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(data, null, 2));

return message.reply(
`${EMOJI.JACKPOT} WINNER ANNOUNCED\n• Ticket: #${winnerNum}\n• Prize: ${EMOJI.MONEY}${data.pool.toLocaleString()}\n${EMOJI.BANK} Prize automatically deposited!`
);
}

return message.reply(
`${EMOJI.INFO} LOTTERY STATUS\n• Tickets sold: ${data.ticketCount}/150\n• Prize pool: ${EMOJI.MONEY}${data.pool.toLocaleString()}\n• Next draw: ${drawTimeStr}`
);
}
}; l.js