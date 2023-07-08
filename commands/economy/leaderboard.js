const {SlashCommandBuilder} = require("discord.js");
const {replyWithEmbed} = require("../../functions/helpers/embedResponse");
const userModel = require("../../models/userModel.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("List of the top 10 richest users")
        .addStringOption((option) => option
            .setName("type")
            .setDescription("The type of leaderboard you want to view")
            .setRequired(false)
            .addChoices(
                {name: "cash", value: "cash"},
                {name: "bank", value: "bank"}
            )
        ),
    async execute(interaction) {
        const {options, guild} = interaction;
        const sortOption = options.getString("type") || "bank";
        let results, leaderboard, i = 0;

        results = await userModel.find({}).sort({[sortOption]: -1}).exec();

        leaderboard = await Promise.all(
            results.map(async (result) => {
                const users = await guild.members
                    .fetch(result.userID)
                    .catch(() => null);
                if (users && !users.user.bot) {
                    if (sortOption === "bank") return `${i}. ${users} | :bank: ${result.bank}`;
                    else if (sortOption === "cash") return `${i}. ${users} | :dollar: ${result.cash}`;
                } else {
                    return null;
                }
            })
        );

        leaderboard = leaderboard.filter((entry) => entry !== null).join(`\n ${i++}. `);

        return replyWithEmbed(
            interaction, `**${sortOption === "bank" ? ":bank: Bank" : ":dollar: Cash"} Leaderboard**\n\n${leaderboard}`,
            `#00ff00`, `:green_circle: Leaderboard`
        )
    }
};
