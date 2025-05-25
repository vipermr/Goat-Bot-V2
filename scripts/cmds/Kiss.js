const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "kiss",
		aliases: ["kiss"],
		version: "1.0",
		author: "NAFIJ",
		countDown: 5,
		role: 0,
		shortDescription: "KISS",
		longDescription: "",
		category: "funny",
		guide: "{pn} @mention or reply"
	},

	onStart: async function ({ api, message, event, args, usersData }) {
		let one, two;

		const mention = Object.keys(event.mentions);
		const replyID = event.messageReply?.senderID;

		if (mention.length === 0 && !replyID)
			return message.reply("Please mention someone or reply to their message.");

		if (mention.length > 0) {
			one = event.senderID;
			two = mention[0];
		} else if (replyID) {
			one = event.senderID;
			two = replyID;
		}

		if (!one || !two)
			return message.reply("Couldn't determine both users to generate the image.");

		const avatarURL1 = await usersData.getAvatarUrl(one);
		const avatarURL2 = await usersData.getAvatarUrl(two);

		const img = await new DIG.Kiss().getImage(avatarURL1, avatarURL2);
		const pathSave = `${__dirname}/tmp/${one}_${two}_kiss.png`;

		fs.writeFileSync(pathSave, Buffer.from(img));

		message.reply({
			body: "😘😘",
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};