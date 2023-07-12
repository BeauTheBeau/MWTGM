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
 * @returns {Promise<Message>|Promise<Message[]>} - The sent Message(s), reply or followup, Promise will reject if the
 * interaction has already been replied or deferred
 */
function replyWithEmbed (interaction, message, color, title) {
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
    });

  const reply = interaction.replied ? interaction.followUp : interaction.reply
  return reply.call(interaction, { embeds: [embedBuilder], ephemeral: true })
}

module.exports = { replyWithEmbed }