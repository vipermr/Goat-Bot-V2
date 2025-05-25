const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "fbpost2",
    version: "1.1",
    author: "NAFIJ ",
    countDown: 5,
    role: 2,
    shortDescription: { en: "Create a Facebook post" },
    longDescription: { en: "Create a Facebook post with text, images, and short video" },
    category: "social",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ event, api, commandName }) {
    const { threadID, messageID, senderID } = event;
    const uuid = getGUID();
    const formData = {
      input: {
        composer_entry_point: "inline_composer",
        composer_source_surface: "timeline",
        idempotence_token: uuid + "_FEED",
        source: "WWW",
        attachments: [],
        audience: {
          privacy: {
            allow: [],
            base_state: "FRIENDS",
            deny: [],
            tag_expansion_state: "UNSPECIFIED"
          }
        },
        message: { ranges: [], text: "" },
        with_tags_ids: [],
        inline_activities: [],
        explicit_place_id: "0",
        text_format_preset_id: "0",
        logging: { composer_session_id: uuid },
        tracking: [null],
        actor_id: api.getCurrentUserID(),
        client_mutation_id: Math.floor(Math.random() * 17)
      },
      feedLocation: "TIMELINE",
      scale: 3,
      renderLocation: "timeline",
      isTimeline: true,
      useDefaultActor: false
    };

    return api.sendMessage(
      `Choose who can see your post:\n1. Everyone\n2. Friends\n3. Only Me`,
      threadID,
      (e, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: senderID,
          formData,
          type: "whoSee"
        });
      },
      messageID
    );
  },

  onReply: async function ({ Reply, event, api, commandName }) {
    const handleReply = Reply;
    if (event.senderID !== handleReply.author) return;

    const { threadID, messageID, attachments, body } = event;
    const botID = api.getCurrentUserID();
    const formData = handleReply.formData;

    async function uploadAttachments(attachments) {
      const uploads = [];
      for (const file of attachments) {
        const form = { file };
        uploads.push(api.httpPostFormData(
          `https://www.facebook.com/profile/picture/upload/?profile_id=${botID}&photo_source=57&av=${botID}`,
          form
        ));
      }
      return Promise.all(uploads);
    }

    if (handleReply.type === "whoSee") {
      if (!["1", "2", "3"].includes(body))
        return api.sendMessage(`Choose 1, 2 or 3 only`, threadID, messageID);

      formData.input.audience.privacy.base_state =
        body === "1" ? "EVERYONE" : body === "2" ? "FRIENDS" : "SELF";

      api.unsendMessage(handleReply.messageID, () => {
        api.sendMessage(
          `Reply with post content (or type 0 to skip):`,
          threadID,
          (e, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: handleReply.author,
              formData,
              type: "content"
            });
          },
          messageID
        );
      });
    }

    else if (handleReply.type === "content") {
      if (body !== "0") formData.input.message.text = body;

      api.unsendMessage(handleReply.messageID, () => {
        api.sendMessage(
          `Now reply with image/video attachment (or type 0 to skip):`,
          threadID,
          (e, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: handleReply.author,
              formData,
              type: "media"
            });
          },
          messageID
        );
      });
    }

    else if (handleReply.type === "media") {
      const allStreamFile = [];

      if (body !== "0") {
        try {
          for (const attach of attachments) {
            if (attach.type === "photo") {
              const image = (await axios.get(attach.url, { responseType: "arraybuffer" })).data;
              const extension = attach.url.split('.').pop().split('?')[0];
              const path = __dirname + `/cache/imagePost.${extension}`;
              fs.writeFileSync(path, Buffer.from(image));
              allStreamFile.push(fs.createReadStream(path));
            } else if (attach.type === "video") {
              const videoPath = __dirname + `/cache/videoPost.mp4`;
              const stream = (await axios.get(attach.url, { responseType: "stream" })).data;
              const writer = fs.createWriteStream(videoPath);
              await new Promise((resolve, reject) => {
                stream.pipe(writer);
                stream.on("end", resolve);
                stream.on("error", reject);
              });
              allStreamFile.push(fs.createReadStream(videoPath));
            }
          }
        } catch (err) {
          return api.sendMessage(`Attachment error. Try: npm install fluent-ffmpeg`, threadID, messageID);
        }

        const uploadFiles = await uploadAttachments(allStreamFile);
        for (let result of uploadFiles) {
          if (typeof result === "string") result = JSON.parse(result.replace("for (;;);", ""));
          if (result.payload?.fbid) {
            formData.input.attachments.push({ photo: { id: result.payload.fbid.toString() } });
          }
        }
      }

      const form = {
        av: botID,
        fb_api_req_friendly_name: "ComposerStoryCreateMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "7711610262190099",
        variables: JSON.stringify(formData)
      };

      api.httpPost('https://www.facebook.com/api/graphql/', form, (e, info) => {
        api.unsendMessage(handleReply.messageID);
        try {
          if (e) throw e;
          if (typeof info === "string") info = JSON.parse(info.replace("for (;;);", ""));
          const postID = info.data.story_create.story.legacy_story_hideable_id;
          const urlPost = info.data.story_create.story.url;

          if (!postID) throw info.errors;

          // Clean cache
          try {
            fs.readdirSync(__dirname + "/cache").forEach(file => {
              if (file.startsWith("imagePost") || file === "videoPost.mp4") {
                fs.unlinkSync(__dirname + `/cache/${file}`);
              }
            });
          } catch (e) {}

          return api.sendMessage(`✅ Post created!\n» Post ID: ${postID}\n» URL: ${urlPost}`, threadID, messageID);
        } catch (err) {
          return api.sendMessage(`❌ Failed to post. Try again later.`, threadID, messageID);
        }
      });
    }
  }
};

function getGUID() {
  let sectionLength = Date.now();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    return (c == "x" ? r : (r & 7) | 8).toString(16);
  });
}