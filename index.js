const {Client, GatewayIntentBits, Collection, Events} = require('discord.js');
const process = require(`node:process`);
const fs = require('fs');

const mongoose = require(`mongoose`);
const userModel = require("./models/userModel.js");
require('dotenv').config()
const token = process.env.TOKEN
const mongoURI = process.env.MONGO_URI;

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
    for (const file of functionFolders)
        try {
            require(`./functions/${folder}/${file}`)(client);
        } catch (err) {
            console.error(err.stack)
        }
}

client.commands = new Collection();
client.commandArray = [];
client.buttons = new Collection();

client.handleEvents();
client.handleCommands();
client.login(token);

// Prevent process from exitting 
process.on('unhandledRejection', err => {
    console.log(`Unhandled promise rejection`, err.stack);
});

process.on('uncaughtException', err => {
    console.log(`Unhandled exception`, err.stack);
});


// Handle DB connection
console.log("Connecting to MongoDB")

mongoose.set(`strictQuery`, true)
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB")
})
    .catch((err) => {
        console.error(err.stack)
    });

// TODO: Ensure all user's have a profile 
client.on(Events.MessageCreate, async (message) => {
    let userData;
    try {
        userData = await userModel.findOne({userID: message.author.id});

        if (!userData) {
            const profile = new userModel({
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

