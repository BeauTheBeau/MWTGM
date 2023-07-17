const mongoose = require(`mongoose`);

const starboardMessageSchema = new mongoose.Schema({
    messageID: {type: String, required: true},
    guildID: {type: String, required: true},
    channelID: {type: String, required: true},
    starboardMessageID: {type: String, required: false},
    starstruck: {type: Array, required: true}
});

const model = mongoose.model(`starboardMessageModel`, starboardMessageSchema);
module.exports = model;
