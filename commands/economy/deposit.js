const {SlashCommandBuilder} = require("discord.js");
const userModel = require("../../models/userModel.js");
const {replyWithEmbed} = require("../../functions/helpers/embedResponse.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Deposit money into your bank")
        .setDMPermission(false)
        .addIntegerOption(option => option
            .setName("amount")
            .setDescription("Defaults to all, number of mouney you want to deposit")
        ),
    async execute(interaction) {
        const {user} = interaction;
        let userData, amount;

        try {
            userData = await userModel.findOne({userID: user.id});
            if (!userData) {
                return await replyWithEmbed(
                    interaction, `This user does not have a profile yet!`,
                    `#ff0000`, `:red_circle: Error`
                )
            }

        } catch (e) {
            console.log(e.stack)
            return await replyWithEmbed(
                interaction, `An error occurred while trying to find this user's data.`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        amount = interaction.options.getInteger("amount") || userData.cash;
        if (amount > userData.cash) {
            return await replyWithEmbed(
                interaction, `You do not have enough cash to deposit that amount!`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        // TODO: Give splits to relevant individual
        const
            totalSplit = amount * 0.05,
            beauSplit = totalSplit / 3,
            arnavSplit = totalSplit / 3,
            gamerSplit = totalSplit - beauSplit - arnavSplit;

        try {
            userData.cash -= amount;
            userData.bank += amount - totalSplit;
            await userData.save()
        } catch (e) {
            console.error(e.stack)
            return await replyWithEmbed(
                interaction, `An error occurred while trying to save this user's data.`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        return await replyWithEmbed(
            interaction, `You have deposited :dollar: **${amount.toLocaleString()}** into your bank account.`
            + `\n\n**${(beauSplit + arnavSplit + gamerSplit).toLocaleString()}** has been split between the authorities.`,
            `#00ff00`, `:green_circle: Deposit`
        )
    }
}