module.exports = {
  config: {
    name: "pay",
    version: "1.1",
    author: "Riley | Modified by NAFIJ_PRO( MODED )",
    role: 0,
    shortDescription: "Give coins to another user",
    category: "Economy",
    guide: "{p}pay <amount> [or reply to user with {p}pay <amount>]",
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, messageReply, threadID } = event;
    const senderData = await usersData.get(senderID);

    let recipientID;
    let amount;

    // Detect if reply-based
    if (messageReply) {
      recipientID = messageReply.senderID;
      amount = parseInt(args[0]);
    } else {
      recipientID = args[0];
      amount = parseInt(args[1]);
    }

    if (!recipientID || isNaN(amount) || amount <= 0) {
      return api.sendMessage("Please mention a valid user and amount.", threadID);
    }

    if (recipientID === senderID) {
      return api.sendMessage("You can't pay yourself.", threadID);
    }

    if (senderData.money < amount) {
      return api.sendMessage("Not enough money to give.", threadID);
    }

    const recipientData = await usersData.get(recipientID);

    senderData.money -= amount;
    recipientData.money += amount;

    await usersData.set(senderID, senderData);
    await usersData.set(recipientID, recipientData);

    const senderName = senderData.name || "Sender";
    const recipientName = recipientData.name || "Recipient";

    const receipt = 
`╭━━━━━━━[ PAYMENT RECEIPT ]━━━━━━━╮
┃  From   : ${senderName}
┃  To     : ${recipientName}
┃  Amount : $${amount}
┃
┃  ✅ Transfer Successful
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
🧾 Signed by: NAFIJ_PRO( MODED )`;

    return api.sendMessage(receipt, threadID);
  }
};