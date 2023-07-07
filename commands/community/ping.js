const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const replyWithEmbed = require("../../functions/helpers/embedResponse");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the API Latency and Client ping")
    .setDMPermission(false),
  async execute(interaction, client) {
    const message = await interaction.deferReply({ fetchReply: true });
    const clientPing = Date.now() - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setTitle("***Ping***")
      .setDescription(`**API Latency:** ${client.ws.ping}\n**Client Ping:** ${clientPing}`)
      .setColor("Yellow");

    await interaction.editReply({ embeds: [embed] });
  },
};