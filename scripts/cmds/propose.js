const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
	config: {
		name: "propose",
		aliases: [],
		version: "1.1",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 0,
		shortDescription: "Propose your love",
		longDescription: "Send a proposal image with tagged or replied user",
		category: "love",
		guide: {
			en: "{pn} @mention\n{pn} (reply to someone's message)"
		}
	},

	onStart: async function ({ message, args, event, api }) {
		let uid1 = event.senderID;
		let uid2;

		if (event.type === "message_reply") {
			uid2 = event.messageReply.senderID;
		} else if (Object.keys(event.mentions).length > 0) {
			uid2 = Object.keys(event.mentions)[0];
		} else {
			return message.reply("❌ | Please mention someone or reply to their message.");
		}

		try {
			const imagePath = await createProposeImage(uid1, uid2);
			await message.reply({
				body: "💌 | Please babe, accept my love... 💘",
				attachment: fs.createReadStream(imagePath)
			});
			fs.unlinkSync(imagePath);
		} catch (err) {
			console.error(err);
			message.reply("❌ | Failed to create the image.");
		}
	}
};

async function createProposeImage(uid1, uid2) {
	const avatar1 = await jimp.read(`https://graph.facebook.com/${uid1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
	const avatar2 = await jimp.read(`https://graph.facebook.com/${uid2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
	avatar1.circle();
	avatar2.circle();

	const baseImage = await jimp.read("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/propose.png");
	baseImage.resize(1077, 718);
	baseImage.composite(avatar1.resize(80, 80), 280, 200);
	baseImage.composite(avatar2.resize(80, 80), 530, 365);

	const outputPath = __dirname + "/propose_temp.png";
	await baseImage.writeAsync(outputPath);
	return outputPath;
}