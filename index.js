const envSetup = require('./functions/helpers/envSetup.no.js')
const secrets = envSetup()

const { token, mongoURI, clientId, dev } = secrets

const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js')
const process = require(`node:process`)
const fs = require('fs')
const chalk = require('chalk')

const mongoose = require(`mongoose`)
const userModel = require('./models/userModel.js')
const starboardMessageModel = require('./models/starboardMessageModel.js')

let startTime

const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b, 0),
})

// Handle DB connection
console.log(`${chalk.blue('Connecting to MongoDB...')}`)
startTime = Date.now()

mongoose.set(`strictQuery`, true)
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {

    console.log(`${chalk.blue(`> Connected to MongoDB in `) + chalk.green(`${Date.now() - startTime}ms`)}`)
    console.log()

    // Login
    startTime = Date.now()
    console.log(`${chalk.blue(`Logging in...`)}`)
    client.login(token)
      .then(() => {
        console.log(`${chalk.blue(`> Logged in as `) + chalk.green(`${client.user.tag} `) + chalk.blue(`in `) + chalk.green(`${Date.now() - startTime}ms`)}`)
        console.log()

        // Load events
        console.log(`${chalk.blue(`Loading events...`)}`)
        startTime = Date.now()
        const functionFolders = fs.readdirSync(`./functions`)
        for (const folder of functionFolders) {
          const functionFiles = fs
            .readdirSync(`./functions/${folder}`)
            .filter((file) => file.endsWith('.js'))

          for (const file of functionFiles) {
            try {
              if (file.includes('.no')) continue
              console.log(`${chalk.blue(`> Loading event: ${file}`)}`)
              require(`./functions/${folder}/${file}`)(client)
            } catch (err) {
              console.error(err.stack)
            }
          }
        }

        console.log(`${chalk.blue(`> Loaded events in `) + chalk.green(`${Date.now() - startTime}ms`)}`)
        console.log()

        // Handle events and commands
        client.commands = new Collection()
        client.commandArray = []
        client.buttons = new Collection()

        client.handleEvents()
        client.handleCommands()

      })
      .catch((err) => {
        console.error(err.stack)
      })
  })
  .catch((err) => {
    console.error(err.stack)
  })

// Prevent the process from exiting
process.on('unhandledRejection', err => {
  console.log(`Unhandled promise rejection`, err.stack)
})

process.on('uncaughtException', err => {
  console.log(`Unhandled exception`, err.stack)
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

    if (!message.reference) return

    const targetMessage = message.reference
    let starboardMessageData

    try {
      starboardMessageData = await starboardMessageModel.findOne({ messageID: message.reference.messageId })
    } catch (err) {
      console.error(err.stack)
    }

    if (targetMessage.channelId === '1126965560421400606') return

    // Starboard
    /* If the message starts with star and is a reply to a message
     * in the #starboard channel, then add the user to the starstruck array
     * and react with a star emoji
     */
    if (
      message.content.toLowerCase().startsWith('star') ||
      message.content.toLowerCase().startsWith(':star_struck:') ||
      message.content.toLowerCase().startsWith(':star:')) {
    } else return

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
        const reply = await message.reply('You already starred this message!')
        setTimeout(() => {
          message.delete()
          reply.delete()
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
      await targetMessage.react('⭐')
      await message.reply('${message.author.username} starred this message! You can as well, by typing `star` and replying to a message!')
    } catch (err) {
      console.error(err.stack)
    }
  }
)
