const groupModel = require(`../../models/groupModel.js`)
const userModel = require(`../../models/userModel.js`)
const { replyWithEmbed } = require('../../functions/helpers/embedResponse.no')
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { createApi } = require('unsplash-js')

// TODO: Migrate to use new helper function for embeds

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`group`)
    .setDescription(`Manage your alignment.`)

    .addSubcommand(subcommand => subcommand
      .setName(`join`)
      .setDescription(`Join a group.`)
      .addStringOption(option =>
        option.setName(`name`)
          .setDescription(`The name of the group.`)
          .setRequired(true)
      ))

    .addSubcommand(subcommand => subcommand
      .setName(`buy`)
      .setDescription(`Buy an image from the group's image pool.`)
      .addStringOption(option =>
        option.setName(`name`)
          .setDescription(`The name of the group.`)
          .setRequired(true)
      ))

    .addSubcommand(subcommand => subcommand
      .setName(`leave`)
      .setDescription(`Leave your current group.`))

    .addSubcommand(subcommand => subcommand
      .setName(`info`)
      .setDescription(`Get information about a group.`)
      .addStringOption(option => option
        .setName(`name`)
        .setDescription(`The name of the group.`)
        .setRequired(true)
      ))

    .addSubcommand(subcommand => subcommand
      .setName(`list`)
      .setDescription(`List all groups.`)),

  async execute (interaction) {

    const subcommand = interaction.options.getSubcommand()
    let userData

    try {
      await userModel.findOne({ userID: interaction.user.id }).then(user => {
        userData = user
      })
    } catch (e) {
      console.error(e)
    }

    if (subcommand === 'join') {

      if (!groupName) return replyWithEmbed(interaction, `You must specify a group name.`, '#ff0000', ':red_circle: Error')

      const groupExists = await groupModel.exists({ name: groupName })
      if (!groupExists) return replyWithEmbed(interaction, `A group with that name does not exist.`, '#ff0000', ':red_circle: Error')

      const groupData = await groupModel.findOne({ name: groupName })
      if (groupData.members.includes(interaction.user.id)) return replyWithEmbed(interaction, `You are already in that group.`, '#ff0000', ':red_circle: Error')

      try {
        await groupModel.updateMany({ members: interaction.user.id }, { $pull: { members: interaction.user.id } })
        await groupModel.findOneAndUpdate({ name: groupName }, { $push: { members: interaction.user.id } })

        // Send message to group channel
        const guild = interaction.guild
        const channel = guild.channels.cache.get(groupData.channelID)
        await channel.send(`<@${interaction.user.id}> has joined the group!`)

        return replyWithEmbed(interaction, `You have successfully joined the group ${groupName}.`, '#00ff00', `:white_check_mark: Successfully joined group`)
      } catch (e) {
        console.error(e.stack)
        return replyWithEmbed(interaction, `An error occurred while trying to join the group.`, '#ff0000', ':red_circle: Error')
      }

    }
    if (subcommand === 'leave') {

      const groupData = await groupModel.findOne({ members: interaction.user.id })
      if (!groupData) return replyWithEmbed(interaction, `You are not in a group.`, '#ff0000', ':red_circle: Error')

      // Check if the user is the owner of the group
      if (groupData.owner === interaction.user.id) return replyWithEmbed(interaction, `You cannot leave a group you own.`, '#ff0000', ':red_circle: Error')

      try {
        await groupModel.updateMany({ members: interaction.user.id }, { $pull: { members: interaction.user.id } })

        const guild = interaction.guild
        const channel = guild.channels.cache.get(groupData.channelID)
        await channel.send(`<@${interaction.user.id}> has left the group!`)

        return replyWithEmbed(interaction, `You have successfully left the group ${groupData.name}.`, '#00ff00', `:white_check_mark: Successfully left group`)
      } catch (e) {
        console.error(e.stack)
        return replyWithEmbed(interaction, `An error occurred while trying to leave the group.`, '#ff0000', ':red_circle: Error')
      }
    }
    if (subcommand === 'info') {

      let groupName = interaction.options.getString('name').toLowerCase()
      if (!groupName) return replyWithEmbed(interaction, `You must specify a group name.`, '#ff0000', ':red_circle: Error')

      // Loop through all groups and check if the name matches
      let groupExists;

      for (const group of await groupModel.find()) {
        if (group.name.toLowerCase() === groupName) {
          groupExists = true
          groupName = group.name
          break
        }
      }

      if (!groupExists) return replyWithEmbed(interaction, `A group with that name does not exist.`, '#ff0000', ':red_circle: Error')

      const groupData = await groupModel.findOne({ name: groupName })

      let owner
      if (groupData.owner === 'Vacant') owner = 'Vacant'
      else owner = await interaction.client.users.fetch(groupData.owner).username

      const members = []
      for (const member of groupData.members) {
        if (member === 'Vacant') members.push('Vacant')
        else members.push(await interaction.client.users.fetch(member).username)
      }

      const embed = new EmbedBuilder()
        .setColor(`#00ff00`)
        .setTitle(`Group Info`)
        .addFields(
          { name: `Name`, value: groupData.name, inline: true },
          { name: `Owner`, value: owner, inline: true },
          { name: `Members`, value: members.join(`\n`), inline: true },
          { name: `Balance`, value: `$${groupData.balance}`, inline: true },
        )
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL(),
        })


      return interaction.reply({ embeds: [embed] })
    }
    if (subcommand === 'list') {
      const groups = await groupModel.find({})
      const groupNames = []

      for (const group of groups) groupNames.push(
        `**[${group.name}](https://discord.com/channels/${group.guildID}/${group.channelID})** | `
        + `${ /*Ignore if "Vacant"*/ group.members[0] === 'Vacant' ? 0 : group.members.length} members | `
        + `:dollar: ${group.balance.toLocaleString()}`)
      if (groupNames.length === 0) return replyWithEmbed(interaction, `There are no groups.`, '#ff0000', `:red_circle: Error`)
      await replyWithEmbed(interaction, `${groupNames.length} groups found!\n- ${groupNames.join(`\n- `)}`, '#00ff00', `:white_check_mark: Groups list`)
    }
    if (subcommand === `buy`) {

      // Buy an image from the target group
      // The proceeds are sent to the group balance
      const groupName = interaction.options.getString(`name`)
      const groupData = await groupModel.findOne({ name: groupName })
      if (!groupData) return replyWithEmbed(interaction, `A group with that name does not exist.`, '#ff0000', ':red_circle: Error')

      // Check if the user has enough money
      if (userData.cash < 5000) return replyWithEmbed(interaction, `You do not have enough money to buy a group image.`, '#ff0000', ':red_circle: Error')

      // Get the key temrs
      const terms = groupData.terms ? groupData.terms : `cat`

      // Get image using Unsplash API
      createApi({
        accessKey: process.env.UNSPLASH_ACCESS_KEY
      }).photos.getRandom({ query: terms, count: 1 }).then(async result => {
        console.log(result.response[0])

        let data = result.response[0]

        const embed = new EmbedBuilder()
          .setColor(`#00ff00`)
          .setAuthor({
            name: `By ${data.user.name}`,
            url: data.user.links.html,
            iconURL: data.user.profile_image.small
          })
          .setImage(data.urls.regular)
          .setTimestamp()
          .setFooter({
            text: `Via Unsplash • ${terms}`,
            iconURL: `https://cdn.iconscout.com/icon/free/png-256/free-unsplash-5285318-4406755.png`
          })
        await interaction.reply({ embeds: [embed] })

        // Update the user's/group's balance
        await userModel.findOneAndUpdate({ userID: interaction.user.id }, { $inc: { cash: -5000 } })
        await groupModel.findOneAndUpdate({ name: groupName }, { $inc: { balance: 5000 } })
      })
    }
  }
}
