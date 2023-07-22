const userModel = require(`../../models/userModel.js`)
const { replyWithEmbed } = require('../../functions/helpers/embedResponse.no')
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`xp`)
    .setDescription(`XP related commands.`)

    .addSubcommand(subcommand => subcommand
      .setName(`info`)
      .setDescription(`Get your, or another user's, XP info.`)
      .addUserOption(option => option
        .setName(`user`)
        .setDescription(`The user to get the XP info of.`))
    )
    .addSubcommand(subcommand => subcommand
      .setName(`leaderboard`)
      .setDescription(`Get the XP leaderboard.`)),

  execute: async function (interaction) {

    const subcommand = interaction.options.getSubcommand()
    const user = interaction.options.getUser(`user`) || interaction.user

    let userData

    try {
      userData = await userModel.findOne({ userID: user.id })

      if (!userData) return await replyWithEmbed(
        interaction, `This user does not have a profile yet!`,
        `#ff0000`, `:red_circle: Error`
      )

    } catch (e) {
      console.log(e.stack)
      return await replyWithEmbed(
        interaction, `An error occurred while trying to find this user's data.`,
        `#ff0000`, `:red_circle: Error`
      )
    }

    if (subcommand === `info`) {
      await replyWithEmbed(
        interaction,
        `**XP:** ${userData.xp}\n` +
        `**Level:** ${userData.level}\n` +
        `**XP to level ${userData.level + 1}:** ${Math.ceil(userData.level * 100 * 1.5)} XP\n` +
        `**Rank:** ${await userModel.countDocuments({ xp: { $gt: userData.xp } }) + 1}/${await userModel.countDocuments()} others\n` +
        (await userModel.countDocuments({ xp: { $gt: userData.xp } }) + 1 !== 1
          ? `**XP to next rank:** ${await userModel.findOne({ xp: { $gt: userData.xp } }).sort({ xp: 1 }).then(user => user.xp - userData.xp)} XP\n`
          : ``),

        `#00ff00`, `:green_circle: ${user.username}'s XP`
      )
    } else if (subcommand === `leaderboard`) {

      // Only show 10 users per page
      const page = interaction.options.getInteger(`page`) || 1
      const usersPerPage = 10
      const usersToSkip = (page - 1) * usersPerPage

      const users = await userModel.find().sort({ xp: -1 }).skip(usersToSkip).limit(usersPerPage)

      let leaderboard = ``
      let rank = usersToSkip + 1

      for (const user of users) {
        if (user.xp === 0) continue
        leaderboard += `${rank}. **<@${user.userID}>** - ${user.xp} XP\n`
        rank++
      }

      // Buttons
      const previousButton = new ButtonBuilder()
        .setCustomId(`leaderboard:previous:${page}`)
        .setLabel(`Previous`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1)

      const nextButton = new ButtonBuilder()
        .setCustomId(`leaderboard:next:${page}`)
        .setLabel(`Next`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(users.length < usersPerPage)

      const actionRow = new ActionRowBuilder()
        .addComponents(previousButton, nextButton)

      await replyWithEmbed(
        interaction, leaderboard, `#00ff00`,
        `:green_circle: XP Leaderboard - Page ${page}`, actionRow
      )
    }
  }
}
