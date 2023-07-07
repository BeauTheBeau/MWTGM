const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`eval`)
    .setDescription(`Beau only`)
    .addStringOption((option) =>
      option.setName("code").setDescription(`code`).setRequired(true)
    ),
  async execute(interaction) {
    const noPerms = new EmbedBuilder()
      .setColor(`Red`)
      .setDescription(`***:warning: Only this bot's developers can use the Command***`);
    if (interaction.user.id !== "729567972070391848" && interaction.user.id !== '947568482407546991')
      return interaction.reply({ embeds: [noPerms], ephemeral: true });

    try {
      const output = eval(interaction.options.getString("code"));

      const outputE = new EmbedBuilder()
        .setColor(`#01142e`)
        .setTitle(`Output`)
        .setDescription(` \`\`\`js\n${output}\`\`\``)
        .setTimestamp()
        .setFooter({ text: `Eval Done By: ${interaction.user.username}` });

      return interaction.reply({
        embeds: [outputE],
        ephemeral: true
      });
    } catch (err) {
      const error = new EmbedBuilder()
        .setColor("Random")
        .setTitle(`Error`)
        .setDescription(`\`\`\`${err.stack}\`\`\``)
        .setTimestamp()
        .setFooter({ text: `Eval Failed By: ${interaction.user.username}` });

      return interaction.reply({
        embeds: [error],
        ephemeral: true
      });
    }
  },
};
