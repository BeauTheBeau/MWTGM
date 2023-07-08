const {SlashCommandBuilder} = require("discord.js");
const {replyWithEmbed} = require("../../functions/helpers/embedResponse");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`say`)
        .setDescription(`Beau & Arnav only`)
        .addStringOption((option) => option
            .setName("text")
            .setDescription(`what should the bot say`)
            .setRequired(true)
        ),
    async execute(interaction) {
        const {channel, options} = interaction;

        if (interaction.user.id !== "852219497763045376" && interaction.user.id !== "947568482407546991") {
            return replyWithEmbed(interaction, `You can't use this command!`, "#ff0000", ":red_circle: Error");
        }

        const text = options.getString("text");
        channel.send(text);

        return replyWithEmbed(interaction, `Sent!`, "#00ff00", ":green_circle: Success");
    }
};
