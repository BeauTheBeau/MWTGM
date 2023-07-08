const {SlashCommandBuilder} = require("discord.js");
const userModel = require("../../models/userModel.js");
const {replyWithEmbed} = require("../../functions/helpers/embedResponse")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check the balance of a specific User or yourself")
        .setDMPermission(false)
        .addUserOption(user => user
            .setName('user')
            .setDescription('Select the user')
        ),
    async execute(interaction) {
        const {options} = interaction;
        const user = options.getMember('user') || interaction.user;
        let userData;

        try {
            userData = await userModel.findOne({userID: user.id});
            if (!userData) return replyWithEmbed(
                interaction, `This user does not have a profile yet!`,
                `#ff0000`, `:red_circle: Error`
            )
        } catch (e) {
            console.log(e.stack)
            return replyWithEmbed(
                interaction, `An error occurred while trying to find this user's data.`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        return replyWithEmbed(interaction,
            `**${user.username}** has :dollar: **${userData.cash.toLocaleString()}** cash in hand and :bank: `
            + `**${userData.bank.toLocaleString()}** in the bank.`, `#00ff00`, `:green_circle: Balance`)
    }
}