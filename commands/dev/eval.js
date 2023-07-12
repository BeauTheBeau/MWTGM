const {SlashCommandBuilder} = require("discord.js");
const {replyWithEmbed} = require("../../functions/helpers/embedResponse.no")

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`eval`)
        .setDescription(`Beau only`)
        .addStringOption((option) =>
            option.setName("code").setDescription(`code`).setRequired(true)
        ),
    async execute(interaction) {

        if (interaction.user.id !== "729567972070391848" && interaction.user.id !== '947568482407546991') {
            return replyWithEmbed(interaction, `You do not have permission to use this command.`, "#ff0000", ":red_circle: Error")
        }

        try {
            const output = eval(interaction.options.getString("code"));
            return replyWithEmbed(interaction, `\`\`\`${output}\`\`\``, "#00ff00", ":white_check_mark: Success")
        } catch (err) {
            return replyWithEmbed(interaction, `\`\`\`${err}\`\`\``, "#ff0000", ":red_circle: Error")
        }
    }
}