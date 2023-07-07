const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`eval`)
        .setDescription(`Beau only`)
        .addStringOption(option => option
            .setName("code")
            .setDescription(`code`)
            .setRequired(true)
        ),
    async execute(interaction) {
        const noPerms = new EmbedBuilder()
          .setColor(`Red`)
          .setDescription(`***:warning: Only beau can use the Command***`)
        if (interaction.user.id !== '729567972070391848') return interaction.reply({embeds: [noPerms], ephemeral: true});
    }
}
    