/**
 * @module EmbedResponse
 */

const { EmbedBuilder } = require('discord.js')

/**
 * @function replyWithEmbed
 * @description Replies to Discord interaction with an embedded message
 * @param {interaction} interaction - The interaction to which the program should reply
 * @param {String} message - The message that should appear in the embed
 * @param color - The color of the embed
 * @param {String} title - The title of the embed
 * @param actionRow
 * @returns {Promise<Message>|Promise<Message[]>} - The sent Message(s), reply or followup, Promise will reject if the
 * interaction has already been replied or deferred
 */
function replyWithEmbed (interaction, message, color, title, actionRow = null) {
  const embedBuilder = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(message)
    .setTimestamp()
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`
    })
    .setFooter({
      text: `Made with ❤️ by beauthebeau.js and arnav1001yt`
    })

  if (actionRow) {

    // Check if deferred or replied
    if (interaction.deferred || interaction.replied) {
      return interaction.edit({
        embeds: [embedBuilder],
        components: [actionRow]
      })
    }

    return interaction.reply({
      embeds: [embedBuilder],
      components: [actionRow]
    })

  } else {

    // Check if deferred or replied
    if (interaction.deferred || interaction.replied) {
      return interaction.edit({
        embeds: [embedBuilder]
      })
    }

    return interaction.reply({
      embeds: [embedBuilder]
    })
  }
}

module.exports = { replyWithEmbed }
