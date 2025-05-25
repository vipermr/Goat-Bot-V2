module.exports = {
	config: {
		name: "ugly",
		version: "2.0",
		author: "Nafij",
		role: 0,
		category: "fun",
		guide: {
			en: "{pn} [@tag | reply | empty]",
			bn: "{pn} [@ট্যাগ | রিপ্লাই | ফাঁকা]"
		}
	},

	onStart: async function ({ api, event, usersData }) {
		let targetID = event.senderID;

		if (event.type === "message_reply") {
			targetID = event.messageReply.senderID;
		} else if (Object.keys(event.mentions).length > 0) {
			targetID = Object.keys(event.mentions)[0];
		}

		const name = await usersData.getName(targetID);
		const percent = (targetID === "100058371606434") ? 0 : Math.floor(Math.random() * 100) + 1;

		return api.sendMessage(
			`Hey ${name}, you're ${percent}% ugly 🙂💩`,
			event.threadID,
			event.messageID
		);
	}
};