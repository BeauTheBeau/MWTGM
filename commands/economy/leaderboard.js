const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../../models/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("List of the top 10 richest users")
        .addStringOption(
            option => option.setName("type")
                .setDescription("The type of leaderboard you want to view")
                .setRequired(false)
                .addChoices(
                    {name: "cash", value: "cash"},
                    {name: "bank", value: "bank"}
                )
        ),
    async execute(interaction, client) {
        const { options } = interaction;
        const sortOption = interaction.options.getString("type") || "bank";
        let results, leaderboard, i = 0;

        results = await userModel.find({}).sort({[sortOption]: -1}).exec()
        leaderboard = results.map(result => {
            i++;
        }).join("\n")

        const embed = new EmbedBuilder()
            .setTitle(`Top 10 users by ${sortOption}`)
            .setDescription(leaderboard)
            .setTimestamp()

        return interaction.reply({embeds: [embed]})
        
    }
}
