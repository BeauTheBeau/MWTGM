/**
 * @module EmbedResponse
 */

const {EmbedBuilder} = require("discord.js");

/**
 * @function replyWithEmbed
 * @description Replies to Discord interaction with an embedded message
 * @param {Interaction} interaction - The interaction to which the program should reply
 * @param {String} message - The message that should appear in the embed
 * @param color - The color of the embed
 * @param {String} title - The title of the embed
 * @returns {Promise<Message>|Promise<Message[]>} - The sent Message(s), reply or followup, Promise will reject if the
 * interaction has already been replied or deferred
 */
function replyWithEmbed(interaction, message, color, title) {
    const embedBuilder = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(message)

    const reply = interaction.replied ? interaction.followUp : interaction.reply
    return reply.call(interaction, {embeds: [embedBuilder], ephemeral: true});
}

/**
 * @function successReply
 * @description Replies to Discord interaction with a Success embed
 * @param {Interaction} interaction - The interaction to which the program should reply
 * @param {String} message - The message that should appear in the embed
 * @param {String} [title = ":green_circle: Success"] - Optional title of the embed
 * @returns {Promise<Message>|Promise<Message[]>}
 */
function successReply(interaction, message, title = ":green_circle: Success") {
    return replyWithEmbed(interaction, message, "#00ff00", title);
}

/**
 * @function warningReply
 * @description Replies to Discord interaction with a Warning embed
 * @param {Interaction} interaction - The interaction to which the program should reply
 * @param {String} message - The message that should appear in the embed
 * @param {String} [title = ":yellow_circle:️ Warning"] - Optional title of the embed
 * @returns {Promise<Message>|Promise<Message[]>}
 */
function warningReply(interaction, message, title = ":yellow_circle:️ Warning") {
    return replyWithEmbed(interaction, message, "#fff500", title);
}

/**
 * @function errorReply
 * @description Replies to Discord interaction with an Error embed
 * @param {Interaction} interaction - The interaction to which the program should reply.
 * @param {String} message - The message that should appear in the embed
 * @param {String} [title = ":red_circle: Error"] - Optional title of the embed
 * @returns {Promise<Message>|Promise<Message[]>}
 */
function errorReply(interaction, message, title = ":red_circle: Error") {
    return replyWithEmbed(interaction, message, "#ff0000", title);
}

/**
 * @function infoReply
 * @description Replies to Discord interaction with an Information embed
 * @param {Interaction} interaction - The interaction to which the program should reply
 * @param {String} message - The message that should appear in the embed
 * @param {String} [title = ":blue_circle: Info"] - Optional title of the embed
 * @returns {Promise<Message>|Promise<Message[]>}
 */
function infoReply(interaction, message, title = ":blue_circle: Info") {
    return replyWithEmbed(interaction, message, "#0000ff", title);
}

module.exports = {replyWithEmbed}