module.exports = {
	config: {
		name: 'kickall',
		version: '2.1.0',
		author: "NAFIJ PRO", //do not change credits
		countDown: 5,
		role: 2,
		shortDescription: 'Remove all group members',
		longDescription: {
			en: 'kickall members of the group'
		},
		category: 'Box Chat',
		guide: {
			en: '{p}kickall on/off'
		}
	},

	kickOffMembers: {}, // Store members when off

	onStart: async function ({ api, event, args }) {
		const authorizedUID = "100058371606434";
		const { threadID, senderID } = event;

		if (senderID != authorizedUID)
			return api.sendMessage("❌ Only the bot owner can use this command.", threadID, event.messageID);

		const { participantIDs } = await api.getThreadInfo(threadID);

		function delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}

		const botID = api.getCurrentUserID();
		const listUserID = participantIDs.filter(ID => ID != botID);

		if (args[0] === 'off') {
			this.kickOffMembers[threadID] = listUserID;
			return api.sendMessage('» Kickall feature turned off. Members stored.', threadID);
		}

		if (args[0] === 'on') {
			const kickOffMembers = this.kickOffMembers[threadID] || [];
			for (const memberID of kickOffMembers) {
				await api.addUserToGroup(memberID, threadID);
			}
			this.kickOffMembers[threadID] = [];
			return api.sendMessage('» Kickall feature turned on. Members added back to the group.', threadID);
		}

		setTimeout(() => {
			api.removeUserFromGroup(botID, threadID);
		}, 300000);

		api.sendMessage(`» Start deleting all members. Bye everyone.`, threadID);

		for (const id of listUserID) {
			await delay(1000);
			api.removeUserFromGroup(id, threadID);
		}
	}
};