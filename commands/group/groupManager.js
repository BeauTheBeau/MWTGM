const groupModel = require(`../../models/groupModel.js`)
const userModel = require(`../../models/userModel.js`)
const { replyWithEmbed } = require('../../functions/helpers/embedResponse.no')
const { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`group-manager`)
    .setDescription(`Create or manage a group you own.`)
    .addSubcommand(subcommand => subcommand
      .setName(`create`)
      .setDescription(`Create a group.`)
      .addStringOption(option =>
        option.setName(`name`)
          .setDescription(`The name of the group.`)
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName(`emoji`)
          .setDescription(`The emoji of the group.`)
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName(`keyterm`)
          .setDescription(`The keyterm used for images to represent the group.`)
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName(`description`)
          .setDescription(`The description of the group.`)
          .setRequired(false)
      ))
    .addSubcommand(subcommand => subcommand
      .setName(`edit`)
      .setDescription(`Edit a group.`)
      .addStringOption(option => option
        .setName(`key`)
        .setDescription(`The key to edit.`)
        .setRequired(true)
        .addChoices(
          { name: `name`, value: `name` },
          { name: `description`, value: `description` },
          { name: `icon`, value: `icon` },
          { name: `banner`, value: `banner` },
          { name: `emoji`, value: `emoji` }
        )
      )
      .addStringOption(option => option
        .setName(`value`)
        .setDescription(`The value to set the key to.`)
        .setRequired(true)
      ))
    .addSubcommand(subcommand => subcommand
      .setName(`pay`)
      .setDescription(`Pay a member of your group.`)
      .addUserOption(option => option
        .setName(`user`)
        .setDescription(`The user to pay.`)
        .setRequired(true)
      )
      .addIntegerOption(option => option
        .setName(`amount`)
        .setDescription(`The amount to pay.`)
        .setRequired(true)
      )),

  async execute (interaction) {

    const subcommand = interaction.options.getSubcommand()
    const groupName = interaction.options.getString(`name`)
    let userData

    try {
      await userModel.findOne({ userID: interaction.user.id }).then(user => {
        userData = user
      })
    } catch (e) {
      console.error(e.stack)
      return replyWithEmbed(interaction, `An error occurred while trying to find your user data.`, '#ff0000', ':red_circle: Error')
    }

    if (subcommand === `create`) {

      if (userData.cash < 10000) return replyWithEmbed(interaction, `You need at least **:dollar: 10,000** to create a group.`, '#ff0000', ':red_circle: Error')
      if (groupName.length > 20) return replyWithEmbed(interaction, `Group names must be 20 characters or less.`, '#ff0000', ':red_circle: Error')

      const groupExists = await groupModel.exists({ name: groupName })
      if (groupExists) return replyWithEmbed(interaction, `A group with that name already exists.`, '#ff0000', ':red_circle: Error')

      // Check if the user is in a group
      const inGroup = await groupModel.findOne({ members: interaction.user.id })
      const ownGroup = await groupModel.findOne({ owner: interaction.user.id })

      if (inGroup) return replyWithEmbed(interaction, `You are already in a group.`, '#ff0000', ':red_circle: Error')
      if (ownGroup) return replyWithEmbed(interaction, `You already own a group.`, '#ff0000', ':red_circle: Error')

      const newGroup = new groupModel({
        name: groupName,
        owner: interaction.user.id,
        members: [interaction.user.id],
        balance: 0,
        guildID: interaction.guild.id,
        emoji: interaction.options.getString(`emoji`),
        terms: interaction.options.getString(`keyterm`),
        description: interaction.options.getString(`description`)
      })

      try {
        // Attempt to create the channel in target category
        const guild = interaction.guild
        const category = guild.channels.cache.get(`1131278239411753090`) || guild.channels.cache.get(`1117517030917148773`)
        const channel = await guild.channels.create({
          name: `${interaction.options.getString(`emoji`)} ${groupName}`,
          type: ChannelType.GUILD_TEXT,
          parent: category,
          permissionOverwrites: [{ // Owner
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ManageChannels]
          }]
        })
        await channel.setParent(category)
        await userModel.findOneAndUpdate({ userID: interaction.user.id }, { $inc: { cash: -10000 } })

        newGroup.balance = 10000
        newGroup.channelID = channel.id
        await newGroup.save()

        await replyWithEmbed(interaction, `You have successfully created the group ${groupName}, and have been given the channel <#${channel.id}>.`, '#00ff00', `:white_check_mark: Successfully created group`)
        const imgURL = `https://source.unsplash.com/random/1920%C3%971080/?${interaction.options.getString(`keyterm`).replace(/ /g, '+')}`
        await interaction.followUp({ content: imgURL, ephemeral: true })

      } catch (e) {
        console.error(e.stack)
        return replyWithEmbed(interaction, `An error occurred while trying to create the group.`, '#ff0000', ':red_circle: Error')
      }
    }
    if (subcommand === `edit`) {

      const group = await groupModel.findOne({ owner: interaction.user.id })
      const targetKey = interaction.options.getString(`key`)
      const targetValue = interaction.options.getString(`value`)

      if (!group) return replyWithEmbed(interaction, `You do not own a group.`, '#ff0000', ':red_circle: Error')

      switch (targetKey) {

        case `name`:
          if (targetValue.length > 20) return replyWithEmbed(interaction, `Group names must be 20 characters or less.`, '#ff0000', ':red_circle: Error')

          const groupExists = await groupModel.exists({ name: targetValue, guildID: interaction.guild.id })
          if (groupExists) return replyWithEmbed(interaction, `A group with that name already exists.`, '#ff0000', ':red_circle: Error')

          // Attempt to edit the channel name
          try {
            const channel = interaction.guild.channels.cache.get(group.channelID)
            await channel.setName(`${group.emoji} ${targetValue}`)
            await groupModel.findOneAndUpdate({ owner: interaction.user.id }, { name: targetValue })
            await replyWithEmbed(interaction, `Successfully changed the group name to ${targetValue}.`, '#00ff00', `:white_check_mark: Successfully edited group`)
          } catch (e) {
            console.error(e.stack)
            return replyWithEmbed(interaction, `An error occurred while trying to edit the group name.`, '#ff0000', ':red_circle: Error')
          }
          break

        case `description`:
          if (targetValue.length > 512) return replyWithEmbed(interaction, `Group descriptions must be 1000 characters or less.`, '#ff0000', ':red_circle: Error')

          try {
            const channel = interaction.guild.channels.cache.get(group.channelID)
            await channel.setTopic(targetValue)

            await groupModel.findOneAndUpdate({ owner: interaction.user.id }, { description: targetValue })
            await replyWithEmbed(interaction, `Successfully changed the group description to ${targetValue}.`, '#00ff00', `:white_check_mark: Successfully edited group`)
          } catch (e) {
            console.error(e.stack)
            return replyWithEmbed(interaction, `An error occurred while trying to edit the group name.`, '#ff0000', ':red_circle: Error')
          }

          break

        case `emoji`:

          // Check if it is actually an emoji
          if (!targetValue.match(/<a?:.+:\d+>/)) return replyWithEmbed(interaction, `That is not a valid emoji.`, '#ff0000', ':red_circle: Error')

          try {
            const channel = interaction.guild.channels.cache.get(group.channelID)
            await channel.setName(`${targetValue} ${group.name}`)
            await groupModel.findOneAndUpdate({ owner: interaction.user.id }, { emoji: targetValue })
            await replyWithEmbed(interaction, `Successfully changed the group emoji to ${targetValue}.`, '#00ff00', `:white_check_mark: Successfully edited group`)
          } catch (e) {
            console.error(e.stack)
            return replyWithEmbed(interaction, `An error occurred while trying to edit the group emoji.`, '#ff0000', ':red_circle: Error')
          }

          break

        default:
          return replyWithEmbed(interaction, `https://http.cat/501`, '#ff0000', ':red_circle: 501 Not Implemented')
      }

    }
    if (subcommand === `pay`) {

      const group = await groupModel.findOne({ owner: interaction.user.id })
      if (!group) return replyWithEmbed(interaction, `You do not own a group.`, '#ff0000', ':red_circle: Error')

      const payoutAmount = interaction.options.getInteger(`amount`)
      if (payoutAmount < 0) return replyWithEmbed(interaction, `You cannot pay out a negative amount.`, '#ff0000', ':red_circle: Error')
      if (payoutAmount > group.balance) return replyWithEmbed(interaction, `You cannot pay out more than your group's balance.`, '#ff0000', ':red_circle: Error')

      const members = group.members
      if (members.length === 1) return replyWithEmbed(interaction, `You cannot pay out to yourself.`, '#ff0000', ':red_circle: Error')
      if (interaction.options.getUser('user') not in members) return replyWithEmbed(interaction, `That user is not in your group.`, '#ff0000', ':red_circle: Error')

      const payoutUser = interaction.options.getUser(`user`)
      const payoutUserModel = await userModel.findOne({ userID: payoutUser.id })
      if (!payoutUserModel) return replyWithEmbed(interaction, `That user does not have an account.`, '#ff0000', ':red_circle: Error')

      try {
        await userModel.findOneAndUpdate({ userID: payoutUser.id }, { $inc: { cash: payoutAmount } })
        await groupModel.findOneAndUpdate({ owner: interaction.user.id }, { $inc: { balance: -payoutAmount } })

        return await replyWithEmbed(interaction, `Successfully paid out ${payoutAmount} to ${payoutUser}.`, '#00ff00', `:white_check_mark: Successfully paid out`)

      } catch (e) {
        console.error(e.stack)
        return replyWithEmbed(interaction, `An error occurred while trying to pay out.`, '#ff0000', ':red_circle: Error')
      }
    }
  }
}
