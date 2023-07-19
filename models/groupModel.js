const mongoose = require(`mongoose`);
// https://source.unsplash.com/random/1920%C3%971080/?word1+word2+word3...

const groupSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    owner: {type: String, required: true},
    members: {type: Array, required: true},
    balance: {type: Number, required: true, default: 0},
    channelID: {type: String, required: true, default: "None"},
    guildID: {type: String, required: true},
    emoji: {type: String, required: true, default: "None"},
    terms: {type: String, required: true, default: "cat"},

    created: {type: Date, required: true, default: Date.now()},
    description: {type: String, required: false, default: "None"},
    icon: {type: String, required: false, default: "None"},
    banner: {type: String, required: false, default: "None"}
});

const model = mongoose.model(`groupModel`, groupSchema);
module.exports = model;
