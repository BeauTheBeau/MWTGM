const userModel = require(`../../models/userModel.js`)
const { replyWithEmbed } = require('../../functions/helpers/embedResponse.no')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js')
const chalk = require('chalk')

module.exports = {
  name: 'interactionCreate',
  async execute (interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client
      const { commandName } = interaction
      const command = commands.get(commandName)
      if (!command) return

      let startTime = Date.now();
      try {
        console.log(`${chalk.green(`[COMMAND]`)} ${chalk.blue(`${interaction.user.username}`)} ran command ${chalk.blue(`${commandName}`)}`)
        await command.execute(interaction, client)
        console.log(`${chalk.green(`> [${chalk.green(`${Date.now() - startTime}ms`)}]`)} ${chalk.blue(`${commandName}`)} finished with no errors`)
      } catch (error) {
        console.log(`${chalk.red(`> [${chalk.red(`${Date.now() - startTime}ms`)}]`)} ${chalk.blue(`${commandName}`)} finished with errors`)
        console.error(error)
        console.log(`${chalk.red(`[ERROR]`)} ${chalk.blue(`${interaction.user.username}`)} ran command ${chalk.blue(`${commandName}`)} and got an error`)
        await interaction.reply({
          content: `Something went wrong while executing this command...`,
          ephemeral: true,
        })
      }
    } else if (interaction.isButton()) {
      const { buttons } = client
      const { customId } = interaction
      const button = buttons.get(customId)

      // What is this for?
      // if (!button) {
      //   new Error(`There is no code for the button ${customId}`)
      //   return interaction.reply({ content: 'Button Clicked', ephemeral: true })
      // }

      // Level leaderboard handling
      // .setCustomId(`leaderboard:next:${page}`)
      // .setCustomId(`leaderboard:previous:${page}`)

      if (customId.startsWith(`leaderboard:`)) {

        let page

        if (customId.startsWith(`leaderboard:next:`)) page = parseInt(customId.split(`:`)[2]) + 1
        else if (customId.startsWith(`leaderboard:previous:`)) page = parseInt(customId.split(`:`)[2]) - 1

        const usersPerPage = 10
        const usersToSkip = (page - 1) * usersPerPage
        const users = await userModel.find().sort({ xp: -1 }).skip(usersToSkip).limit(usersPerPage)

        let leaderboard = ``
        let rank = usersToSkip + 1

        for (const user of users) {
          leaderboard += `${rank}. **<@${user.userID}>** - ${user.xp} XP\n`
          rank++
        }

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`leaderboard:previous:${page}`)
              .setLabel(`Previous`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 1),
            new ButtonBuilder()
              .setCustomId(`leaderboard:next:${page}`)
              .setLabel(`Next`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(users.length < usersPerPage),
          )

        // Edit the original message
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(`:green_circle: XP Leaderboard - Page ${page}`)
              .setDescription(leaderboard)
              .setColor(`#00ff00`)
              .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`
              })
              .setTimestamp()
              .setAuthor({
                name: `${interaction.user.username}`,
                iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`
              })
          ],
          components: [row]
        })
      }
    }
  }
}