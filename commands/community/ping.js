const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the API Latency and Client ping")
    .setDMPermission(false),
  async execute(interaction, client) {
    const message = await interaction.deferReply({ fetchReply: true });
    const clientping = message.createTimestamp - interaction.createTimestamp

    const embed = new EmbedBuilder()
      .setTitle("***Ping***")
      .setDescription(`**API Latency:** ${client.ws.ping}\n**Client Ping:** ${clientping}`)
      .setColor("Yellow");
    await interaction.editReply({ embeds: [embed] });
  },
};