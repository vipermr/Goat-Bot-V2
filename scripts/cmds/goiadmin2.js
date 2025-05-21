module.exports = {
	config: {
		name: "goiadmin",
		author: "NIsAN",
		role: 0,
		shortDescription: " ",
		longDescription: "",
		category: "BOT",
		guide: "{pn}"
	},

onChat: function({ api, event }) {
	if (event.senderID !== "100058371606434") {
		var aid = ["100058371606434"];
		for (const id of aid) {
		if ( Object.keys(event.mentions) == id) {
			var msg = ["KI BOLO AMAR KASE😾"];
			return api.sendMessage({body: msg[Math.floor(Math.random()*msg.length)]}, event.threadID, event.messageID);
		}
		}}
},
onStart: async function({}) {
	}
};
