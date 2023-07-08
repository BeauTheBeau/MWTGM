require('dotenv').config()

const {Client, GatewayIntentBits, Collection, Events} = require('discord.js');
const process = require(`node:process`);

const fs = require('fs');
const mongoose = require(`mongoose`);
const userModel = require("./models/userModel.js");
const token = process.env.TOKEN
const mongoURI = process.env.MONGO_URI

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
    ]
});

const functionFolders = fs.readdirSync(`./functions`);
for (const folder of functionFolders) {
    const functionFolders = fs
        .readdirSync(`./functions/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of functionFolders) {
        try {

            require(`./functions/${folder}/${file}`)(client);
        } catch (err) {
            console.error(err.stack);
        }
    }
}

client.buttons = new Collection();
client.commands = new Collection();
client.commandArray = [];

client.handleEvents();
client.handleCommands();
client.login(token);

// Handle DB connection
mongoose.set(`strictQuery`, true)
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.error(err.stack)
});

client.on(Events.MessageCreate, async (message) => {
    let userData;
    try {
        userData = await userModel.findOne({userID: message.author.id});

        if (!userData) {
            await new userModel({
                userID: message.author.id,
                bank: 500,
                cash: 0,
                alignment: "None"
            }).save()
        }

    } catch (err) {
        console.error(err.stack)
    }
})


// Prevent the process from exiting
process.on('unhandledRejection', err => {
    console.log(`Unhandled promise rejection`, err.stack);
});

process.on('uncaughtException', err => {
    console.log(`Unhandled exception`, err.stack);
});

module.exports = client;