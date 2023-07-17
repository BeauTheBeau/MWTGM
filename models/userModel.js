const mongoose = require(`mongoose`);

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    bank: { type: Number, required: true, default: 0 },
    cash: { type: Number, required: true, default: 500 },
    alignment: { type: String, required: false, default: "None" },
    xp: { type: Number, required: true, default: 0 },
    level: { type: Number, required: true, default: 0 }
});

const model = mongoose.model(`userModel`, userSchema);
module.exports = model;