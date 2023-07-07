const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`say`)
    .setDescription(`Beau & Arnav only`)
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription(`what should the bot say`)
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const { channel, options } = interaction;

    const noPerms = new EmbedBuilder()
      .setColor(`Red`)
      .setDescription(`***:warning: Only beau & arnav can use the Command***`);
    if (
      interaction.user.id !== "729567972070391848" &&
      interaction.user.id !== "947568482407546991"
    )
      return interaction.reply({ embeds: [noPerms], ephemeral: true });

    const text = options.getString(`text`);

    const replyEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription("***✅ Successfully sent the text***");
    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });

    channel.send(`${text}`);
  },
};
