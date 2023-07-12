const envSetup = require('./functions/helpers/envSetup.no.js')
const secrets = envSetup()

const token = secrets.token, mongoURI = secrets.mongoURI, clientId = secrets.clientId, dev = secrets.dev

const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js')
const process = require(`node:process`)
const fs = require('fs')

const mongoose = require(`mongoose`)
const userModel = require('./models/userModel.js')
const starboardMessageModel = require('./models/starboardMessageModel.js')

const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b, 0),
})

const functionFolders = fs.readdirSync(`./functions`)
for (const folder of functionFolders) {
  const functionFolders = fs
    .readdirSync(`./functions/${folder}`)
    .filter((file) => file.endsWith('.js'))
  for (const file of functionFolders)
    try {
      if (file.includes('.no')) continue
      console.log(`Loading ${file}`)
      require(`./functions/${folder}/${file}`)(client)
    } catch (err) {
      console.error(err.stack)
    }
}

client.commands = new Collection()
client.commandArray = []
client.buttons = new Collection()

client.handleEvents()
client.handleCommands()
client.login(token).then(() => {
  console.log('Logged in')
})

// Prevent the process from exiting
process.on('unhandledRejection', err => {
  console.log(`Unhandled promise rejection`, err.stack)
})

process.on('uncaughtException', err => {
  console.log(`Unhandled exception`, err.stack)
})

// Handle DB connection
console.log('Connecting to MongoDB')

mongoose.set(`strictQuery`, true)
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB')
})
  .catch((err) => {
    console.error(err.stack)
  })

client.on(Events.MessageCreate, async (message) => {
    let userData
    try {
      userData = await userModel.findOne({ userID: message.author.id })

      if (!userData) {
        await new userModel({
          userID: message.author.id,
          bank: 500,
          cash: 0,
          alignment: 'None'
        }).save()
      }
    } catch (err) {
      console.error(err.stack)
    }

    // If a user replies to another message
    if (!message.reference) return

    if (
      message.content.toLowerCase().startsWith('star') ||
      message.content.toLowerCase().startsWith(':star_struck:') ||
      message.content.toLowerCase().startsWith(':star:')) {
    } else {
      return
    }

    const targetMessage = message.reference

    if (targetMessage.channelId === '1126965560421400606') return
    let starboardMessageData

    try {
      starboardMessageData = await starboardMessageModel.findOne({ messageID: message.reference.messageId })
    } catch (err) {
      console.error(err.stack)
    }

    // If the message does not exist in the database
    if (!starboardMessageData) {
      const starboardMessage = await new starboardMessageModel({
        messageID: targetMessage.messageId,
        guildID: targetMessage.guildId,
        channelID: targetMessage.channelId,
        starstruck: [],
        sent: false
      }).save()

      await starboardMessage.save()
      starboardMessageData = starboardMessage
    }

    try {
      // If the user is not already starstruck
      if (starboardMessageData.starstruck.includes(message.author.id)) {
        await message.react('🚫')
        setTimeout(() => {
          message.delete()
        }, 2000)
      } else {
        starboardMessageData.starstruck.push(message.author.id)
        await starboardMessageData.save()

        // If starstruck count is 1+
        if (starboardMessageData.starstruck.length >= 1) {

          const starboardChannel = await client.channels.fetch('1126965560421400606')
          const targetChannel = await client.channels.fetch(starboardMessageData.channelID)
          const targetMessage = await targetChannel.messages.fetch(starboardMessageData.messageID)

          if (starboardMessageData.sent === false) {
            const embed = new EmbedBuilder()
              .setTitle(`Message by ${targetMessage.author.username} in #${targetChannel.name}`)
              .setDescription(`**${starboardMessageData.starstruck.length}** :star: ${targetMessage.content}\n`
                + `[Jump to message](${targetMessage.url})`)
              .setTimestamp()

            const sentMessage = await starboardChannel.send({ embeds: [embed] })
            starboardMessageData.sent = true
            starboardMessageData.starboardMessageID = sentMessage.id
            await starboardMessageData.save()
          } else {

            const starboardMessage = await starboardChannel.messages.fetch(starboardMessageData.starboardMessageID)
            const embed = new EmbedBuilder()
              .setTitle(`Message by ${targetMessage.author.username} in #${targetChannel.name}`)
              .setDescription(`**${starboardMessageData.starstruck.length}** :star: ${targetMessage.content}\n`
                + `[Jump to message](${targetMessage.url})`)
              .setTimestamp()

            await starboardMessage.edit({ embeds: [embed] })

          }

        }
      }
    } catch (err) {
      console.error(err.stack)
    }

    try {
      await message.react('⭐')
      setTimeout(() => {
        message.delete()
      }, 2000)
    } catch (err) {
      console.error(err.stack)
    }

  }
)
