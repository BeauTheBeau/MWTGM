const {SlashCommandBuilder} = require("discord.js");
const {replyWithEmbed} = require("../../functions/helpers/embedResponse.no");
const userModel = require("../../models/userModel.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("donate")
        .setDescription("Donate money to a user's wallet")
        .setDMPermission(false)
        .addUserOption(option => option
            .setName("target")
            .setDescription("The user you want to give the money to")
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName("amount")
            .setDescription("Amount of money you'd like to donate")
            .setRequired(true)
        ),

    /** DOCUMENTATION
     * ==========================================================
     * Arnav: best command for people who don't have money to give 5% tax
     *
     * Beau: I LOVE TAXES
     *
     * Arnav: SAME! (TAKES SCREENSHOT)
     *
     * Beau: (ALSO TAKES SCSREENSHOT)
     *
     *
     * # =========================

     * DOCUMENTATION END */

    async execute(interaction) {
        const {options, user} = interaction;
        const target = interaction.options.getMember(`target`);
        let userData, targetData, amount;

        try {

            if (target.id === user.id) {
                return await replyWithEmbed(
                    interaction, `You can't donate to yourself!`,
                    `#ff0000`, `:red_circle: Error`
                )
            }

            userData = await userModel.findOne({userID: user.id});
            targetData = await userModel.findOne({userID: target.id});

            if (!userData) {
                return await replyWithEmbed(
                    interaction, `You don't have a profile yet!`,
                    `#ff0000`, `:red_circle: Error`
                )
            }

            if (!targetData) {
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

        amount = options.getInteger("amount");
        if (!userData.cash) {
            return await replyWithEmbed(
                interaction, `You do not have enough cash to donate that amount!`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        try {
            userData.cash -= Math.floor(amount);
            targetData.cash += Math.floor(amount);
            await userData.save()
            await targetData.save()
        } catch (e) {
            console.error(e.stack)
            return await replyWithEmbed(
                interaction, `An error occurred while trying to save this user's data.`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        return await replyWithEmbed(
            interaction, `You have donated **${amount.toLocaleString()}** to **${target.user.username}**!`,
            `#00ff00`, `:white_check_mark: Success`
        )
    }
}