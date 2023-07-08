const mongoose = require(`mongoose`);

const starboardMessageSchema = new mongoose.Schema({
    messageID: {type: String, required: true},
    guildID: {type: String, required: true},
    channelID: {type: String, required: true},
    starstruck: {type: Array, required: true},
    sent: {type: Boolean, required: true, default: false}
});

const model = mongoose.model(`starboardMessageModel`, starboardMessageSchema);
module.exports = model;
