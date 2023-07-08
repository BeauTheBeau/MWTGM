const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js')
const process = require(`node:process`)
const fs = require('fs')

const mongoose = require(`mongoose`)
const replyWithEmbed = require('./functions/helpers/embedResponse.js')
const userModel = require('./models/userModel.js')
const starboardMessageModel = require('./models/starboardMessageModel.js')
require('dotenv').config()
const token = process.env.TOKEN
const mongoURI = process.env.MONGO_URI

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
client.login(token)

// Prevent process from exitting 
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

// TODO: Ensure all user's have a profile 
client.on(Events.MessageCreate, async (message) => {
    let userData
    try {
      userData = await userModel.findOne({ userID: message.author.id })

      if (!userData) {
        const profile = new userModel({
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
    if (message.reference) {

      // If the message begins with "STAR"
      if (
        message.content.toLowerCase().startsWith('star') ||
        message.content.toLowerCase().startsWith(':star_struck:') ||
        message.content.toLowerCase().startsWith(':star:')) {
        console.log('Message does start with STAR')
      } else {
        console.log(message.content)
        console.log('Message does not start with STAR')
        return 0
      }

      const targetMessage = message.reference
      console.log(targetMessage)

      if (targetMessage.channelId === '1126965560421400606') return 0
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
        }
        else {
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
  }
)
