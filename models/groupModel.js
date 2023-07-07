const mongoose = require(`mongoose`);

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    owner: { type: String, required: true },
    members: { type: Array, required: true },
    balance: { type: Number, required: true, default: 0 },
    channelID: { type: String, required: false, default: "None" },

    created: { type: Date, required: true, default: Date.now() },
    description: { type: String, required: false, default: "None" },
    icon: { type: String, required: false, default: "None" },
    color: { type: String, required: false, default: "None" },
    banner: { type: String, required: false, default: "None" }
});

const model = mongoose.model(`groupModel`, groupSchema);
module.exports = model;
