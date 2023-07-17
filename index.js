const envSetup = require('./functions/helpers/envSetup.no.js')
const secrets = envSetup()

const { token, mongoURI, clientId, debug } = secrets

const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js')
const process = require(`node:process`)
const fs = require('fs')
const chalk = require('chalk')

const features = {
  'nerdboard': false,
  'starboard': false,
  'xp': true
}

const options = {}

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
          alignment: 'None',
          xp: 0,
          level: 0
        }).save()
      }
    } catch (err) {
      console.error(err.stack)
    }

    if (features.xp) {
      if (message.author.bot) return

      const xp = Math.floor(Math.random() * 10) + 15
      const xpToNextLevel = Math.ceil(userData.level * 100 * 1.5)
      const newXP = userData.xp + xp
      const newLevel = Math.floor(0.1 * Math.sqrt(newXP))
      const levelDifference = newLevel - userData.level

      if (newLevel > userData.level) {
        message.channel.send(`Congratulations ${message.author}! You've leveled up to level ${newLevel}!`)
        await userModel.findOneAndUpdate({ userID: message.author.id }, { level: newLevel })
      }

      if (newXP >= xpToNextLevel) await userModel.findOneAndUpdate({ userID: message.author.id }, { xp: newXP })

      if (debug === "true" || message.content.includes("~dev")) {

        await message.channel.send({
          content: `\`\`\`js\n`
            + `"XP"                ${userData.xp}\n`
            + `"XP Before"         ${userData.xp - xp}\n`
            + `"XP After"          ${userData.xp + xp}\n`

            + `\n`
            + `"Level"             ${userData.level}\n`
            + `"Level Before"      ${userData.level - levelDifference}\n`
            + `"Level After"       ${userData.level + levelDifference}\n`

            + `\n`
            + `"XP to Next Level"  ${xpToNextLevel}\n`
            + `"XP Gained"         ${xp}\n`
            + `\`\`\``

        })
      }
    }

    /**
     * @name: Starboard
     * @description: Handles the starboard - when a message is starred and its star count is above the threshold,
     * it is sent to the starboard channel or updated if it already exists in the starboard channel.
     * @param {Object} message - The message object
     * @param {Object} targetMessage - The message object of the message that was starred
     * @param {Object} starboardMessageData - The starboard message data object
     * @param {String} starboardChannel - The ID of the starboard channel
     * @param {Number} starCount - The number of stars the message has
     * @param {Object} starboardMessage - The starboard message object
     */

    const starboardChannel = `1034630838081552495`
    const nerdboardChannel = `1126965560421400606`

    if (features.starboard) {
      if (!message.reference) return
      const targetMessage = await message.channel.messages.fetch(message.reference.messageId)
      if (!targetMessage) return

      if (
        message.content.toLowerCase().startsWith('nerd') ||
        message.content.toLowerCase().startsWith('🤓')
      ) await targetMessage.react('🤓')

      if (message.channel.id === starboardChannel) return
      if (message.author.bot) return

      const starboardMessageData = await starboardMessageModel.findOne({ messageID: targetMessage.id })
      const starCount = starboardMessageData ? starboardMessageData.starCount : 0

      // Update the DB
      if (!starboardMessageData) {
        await new starboardMessageModel({
          messageID: targetMessage.id,
          guildID: targetMessage.guild.id,
          channelID: targetMessage.channel.id,
          starboardMessageID: undefined,
          starstruck: [message.author.id]
        }).save()
      } else {
        await starboardMessageModel.findOneAndUpdate({ messageID: targetMessage.id }, {
          starboardMessageID: message.id,
          $addToSet: { starstruck: `${message.author.id}${Math.random().toString(36).substring(7)}` }
        })
      }

      if (starCount >= 0) {

        const starboardMessage = await message.channel.messages.fetch(starboardMessageData.starboardMessageID)
        let starboardEmbed = starboardMessage.embeds[0]

        if (starboardEmbed) {
          starboardEmbed = await new EmbedBuilder(starboardEmbed)
          starboardEmbed.setAuthor({
            name: `${targetMessage.author.tag} (${targetMessage.author.id})`,
            iconURL: targetMessage.author.avatarURL
          })
          starboardEmbed.setDescription(targetMessage.content)
          starboardEmbed.setFooter({
            text: `${starCount} ⭐ | ${targetMessage.id}`
          })
        }

        if (!starboardEmbed) {
          starboardEmbed = await new EmbedBuilder()
            .setAuthor(`${targetMessage.author.tag} (${targetMessage.author.id})`, targetMessage.author.avatarURL)
            .setDescription(targetMessage.content)
            .setFooter(`${starCount} ⭐ | ${targetMessage.id}`)
        }

        if (starboardMessage) {
          starboardMessage.edit({
            embeds: [starboardEmbed]
          })
        }

        if (!starboardMessage) {
          const sentMessage = await client.channels.cache.get(starboardChannel).send({
            embeds: [starboardEmbed]
          })

          await new starboardMessageModel({
            messageID: targetMessage.id,
            starboardMessageID: sentMessage.id,
            starCount: starCount
          }).save()
        }
      }
    }

  }
)
