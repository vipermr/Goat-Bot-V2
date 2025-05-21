const axios = require("axios");

module.exports = {
	config: {
		name: "setavt",
		aliases: ["changeavt", "setavatar"],
		version: "1.4",
		author: "NAFIJ_PRO( MODED )",
		countDown: 5,
		role: 2,
		description: "Change the bot's avatar",
		category: "owner",
		guide: {
			en: `Usage:
  {pn} [<image url> | reply with image] [<caption>] [<expirationAfter (seconds)>]

Examples:
  {pn} https://example.com/image.jpg
  {pn} https://example.com/image.jpg Hello
  {pn} https://example.com/image.jpg Hello 3600
  (Also supports replying to an image message)`
		}
	},

	langs: {
		en: {
			cannotGetImage: "❌ | An error occurred while fetching the image URL.",
			invalidImageFormat: "❌ | Invalid image format.",
			changedAvatar: "✅ | Bot avatar changed successfully."
		}
	},

	onStart: async function ({ message, event, api, args, getLang }) {
		const imageURL = (args[0] || "").startsWith("http")
			? args.shift()
			: event.attachments?.[0]?.url || event.messageReply?.attachments?.[0]?.url;

		const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
		const caption = args.join(" ");

		if (!imageURL) return message.SyntaxError();

		let response;
		try {
			response = await axios.get(imageURL, { responseType: "stream" });
		} catch (err) {
			return message.reply(getLang("cannotGetImage"));
		}

		if (!response.headers["content-type"].includes("image"))
			return message.reply(getLang("invalidImageFormat"));

		response.data.path = "avatar.jpg";

		api.changeAvatar(response.data, caption, expirationAfter ? expirationAfter * 1000 : null, err => {
			if (err) return message.err(err);
			return message.reply(getLang("changedAvatar"));
		});
	}
};