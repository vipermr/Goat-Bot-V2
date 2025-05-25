const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "trigger",
		version: "1.2",
		author: "NAFIJ x NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: "Trigger image",
		longDescription: "Generate trigger GIF from user's avatar",
		category: "image",
		guide: {
			en: "{pn} [@tag | reply | blank]",
			vi: "{pn} [@tag | trả lời | để trống]"
		}
	},

	onStart: async function ({ event, message, usersData }) {
		let uid;

		if (event.messageReply) {
			uid = event.messageReply.senderID;
		} else if (Object.keys(event.mentions).length > 0) {
			uid = Object.keys(event.mentions)[0];
		} else {
			uid = event.senderID;
		}

		try {
			const avatarURL = await usersData.getAvatarUrl(uid);
			const img = await new DIG.Triggered().getImage(avatarURL);
			const pathSave = `${__dirname}/tmp/${uid}_Trigger.gif`;

			fs.writeFileSync(pathSave, Buffer.from(img));
			message.reply({
				attachment: fs.createReadStream(pathSave)
			}, () => fs.unlinkSync(pathSave));
		} catch (err) {
			console.error(err);
			message.reply("❌ Failed to generate trigger image.");
		}
	}
};