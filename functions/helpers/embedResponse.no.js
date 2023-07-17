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
 * @param {Array} actionRow - Action rows to be added to the embed
 * @param {Boolean} ephemeral - Whether the message should be private or not
 * @returns {Promise<Message>|Promise<Message[]>} - Sent Message(s), reply or followup, Promise will reject if the
 * interaction has already been replied or deferred
 */
function replyWithEmbed (interaction, message, color, title, actionRow = null, ephemeral = true) {
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
        components: [actionRow],
        ephemeral: ephemeral
      })
    }

    return interaction.reply({
      embeds: [embedBuilder],
      components: [actionRow],
      ephemeral: ephemeral
    })

  } else {

    // Check if deferred or replied
    if (interaction.deferred || interaction.replied) {
      return interaction.edit({
        embeds: [embedBuilder],
        ephemeral: ephemeral
      })
    }

    return interaction.reply({
      embeds: [embedBuilder],
      ephemeral: ephemeral
    })
  }
}

module.exports = { replyWithEmbed }
