const {SlashCommandBuilder} = require("discord.js");
const {replyWithEmbed} = require("../../functions/helpers/embedResponse.no");
const userModel = require("../../models/userModel.js");
const cooldownSchema = require('../../models/robCooldownModel.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rob")
        .setDescription("Rob money from a user's wallet")
        .setDMPermission(false)
        .addUserOption(option => option
            .setName("target")
            .setDescription("The user you want to rob")
            .setRequired(true)
        ),
    async execute(interaction) {
        const {options, user} = interaction;
        const target = options.getMember(`target`);
        let userData, targetData, amount;
        let cooldownTime = 8 * 60 * 60 * 1000;

        const cooldownData = await cooldownSchema.findOne({userID: user.id, command: 'rob'});

        if (cooldownData && Date.now() < cooldownData.cooldownEnd) {
            const remainingMilliseconds = cooldownData.cooldownEnd - Date.now()
            const remainingTimeUnix = Math.floor((Date.now() + remainingMilliseconds) / 1000);

            return await replyWithEmbed(
                interaction, `You can rob again in <t:${remainingTimeUnix}:R> seconds`,
                `#ff0000`, `:red_circle: Error`
            )
        }
        try {

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
                    interaction, `You can't rob from someone who doesn't have a profile!`,
                    `#ff0000`, `:red_circle: Error`
                )
            }

            if (!targetData.cash) {
                return await replyWithEmbed(
                    interaction, `You can't rob from someone who doesn't have any cash!`,
                    `#ff0000`, `:red_circle: Error`
                )
            }

        } catch (e) {
            console.log(e.stack)
            return await replyWithEmbed(
                interaction, `You can't rob from someone who doesn't have any :dollar: cash!`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        amount = Math.floor(Math.random() / 2 * targetData.cash);

        try {
            targetData.cash -= Math.floor(amount);
            userData.cash += Math.floor(amount);
            await userData.save()
            await targetData.save()
        } catch (e) {
            console.error(e.stack)
            return await replyWithEmbed(
                interaction, `You can't rob from someone who doesn't have any :dollar: cash!`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        await replyWithEmbed(
            interaction, `You robbed :dollar: ${amount} from ${target.user.username}!`,
            `#00ff00`, `:white_check_mark: Success`
        )

        const cooldownEnd = Date.now() + cooldownTime;

        if (cooldownData) {
            cooldownData.cooldownEnd = cooldownEnd
            await cooldownData.save()
        } else {
            await new cooldownSchema({
                userID: user.id,
                command: 'rob',
                cooldownStart: Date.now(),
                cooldownEnd: cooldownEnd
            }).save();
        }

        setTimeout(async () => {
            await cooldownSchema.deleteOne({userID: user.id})
        }, cooldownTime);
    }
}