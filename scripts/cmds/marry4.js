const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs")

module.exports = {
    config: {
        name: "marry4",
        aliases: ["marryv4", "marryfour"],
        version: "1.0",
        author: "LEARN TO EAT LEARN TO SPEAK BUT DON'T TRY TO CHANGE THE CREDIT AKASH",
        countDown: 5,
        role: 0,
        shortDescription: "get a wife",
        longDescription: "mention your love❗",
        category: "love",
        guide: "{pn}"
    },

    onStart: async function ({ message, event, args }) {
        const mention = Object.keys(event.mentions);

        // If no mention and no reply, prompt user
        if (mention.length === 0 && !event.messageReply) {
            return message.reply("Please mention someone or reply to their message❗");
        }

        let one = event.senderID;
        let two;

        if (mention.length === 1) {
            two = mention[0];
        } else if (mention.length > 1) {
            // If more than one mention, take the first two mentions (order swapped as in your original code)
            one = mention[1];
            two = mention[0];
        } else if (event.messageReply) {
            two = event.messageReply.senderID;
        }

        if (one === two) {
            return message.reply("You cannot marry yourself! Please mention or reply to someone else.");
        }

        bal(one, two).then(pth => {
            message.reply({ body: "got married 😍", attachment: fs.createReadStream(pth) });
        }).catch(err => {
            message.reply("Oops, something went wrong.");
            console.error(err);
        });
    }
};

async function bal(one, two) { //credit akash #_#

    let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avone.circle();
    let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avtwo.circle();

    let pth = "marryv4.png";
    let img = await jimp.read("https://i.postimg.cc/XN1TcH3L/tumblr-mm9nfpt7w-H1s490t5o1-1280.jpg");

    img.resize(1024, 684)
       .composite(avone.resize(85, 85), 204, 160)
       .composite(avtwo.resize(80, 80), 315, 105); //don't change the credit X-------D

    await img.writeAsync(pth);
    return pth;
}