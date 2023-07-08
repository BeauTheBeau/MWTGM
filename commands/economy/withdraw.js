const { SlashCommandBuilder } = require("discord.js");
const { replyWithEmbed } = require("../../functions/helpers/embedResponse");
const userModel = require("../../models/userModel.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Withdraw money from your bank")
        .setDMPermission(false)
        .addIntegerOption(option => option
            .setName("amount")
            .setDescription(":dollar: Cash you want to withdraw from the :bank: bank. Default is all of it.")
        ),
    async execute(interaction) {
        const { user } = interaction;
        let userData, amount;

        try {
            userData = await userModel.findOne({ userID: user.id });
            if (!userData) {
                return await replyWithEmbed(
                    interaction, `You don't have a profile yet!`,
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

        amount = interaction.options.getInteger("amount") || userData.bank;
        if (amount > userData.bank) {
            return await replyWithEmbed(
                interaction, `You do not have enough money in your bank to withdraw that amount!`,
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
            userData.bank -= amount;
            userData.cash += amount - totalSplit;
            await userData.save()
        } catch (e) {
            console.error(e.stack)
            return await replyWithEmbed(
                interaction, `An error occurred while trying to save this user's data.`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        return await replyWithEmbed(
            interaction, `You have withdrawn :dollar: **${amount.toLocaleString()}** from your :bank: bank.`
            + `\n\n**${(beauSplit + arnavSplit + gamerSplit).toLocaleString()}** has been split between the authorities.`,
            `#00ff00`, `:green_circle: Withdraw`
        )
    }
}

