const mongoose = require(`mongoose`);

const cooldownSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    command: String,
    cooldownStart: Date,
    cooldownEnd: Date,
})

const model = mongoose.model(`workCooldown`, cooldownSchema);
module.exports = model;