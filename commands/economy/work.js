const { SlashCommandBuilder } = require("discord.js");
const { replyWithEmbed } = require("../../functions/helpers/embedResponse")
const userModel = require("../../models/userModel.js");
const cooldownSchema = require('../../models/workCooldownModel.js')

const workTexts = [
    "working as a housewife",
    "working as a Janitor",
    "working as a Doctor",
    "working as a Cop",
    "working as a Social Media influencer"
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Work to earn moneys")
        .setDMPermission(false),

    async execute(interaction, client) {
        const { user } = interaction;
        let userData;
        let cooldownTime =  8 * 60 * 60 * 1000;

        const cooldownData = await cooldownSchema.findOne({ userID: user.id,  command: 'work' });

        if (cooldownData && Date.now() < cooldownData.cooldownEnd) {
            const remainingMilliseconds = cooldownData.cooldownEnd - Date.now()
            const remainingTimeUnix = Math.floor((Date.now() + remainingMilliseconds) / 1000);
            return await replyWithEmbed(
                interaction, `You can work again in <t:${remainingTimeUnix}:R>`,
                `#ff0000`, `:red_circle: Error`
            )
        }
        try {
            userData = await userModel.findOne({ userID: user.id });

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

        const
            min = 100,
            max = 10000,
            num = Math.floor(Math.random() * (max - min + 1)) + min;

        try {
            userData.cash += num;
            await userData.save()
        } catch (e) {
            console.error(e.stack)
            return await replyWithEmbed(
                interaction, `An error occurred while trying to save this user's data.`,
                `#ff0000`, `:red_circle: Error`
            )
        }

        const workMessage = workTexts[Math.floor(Math.random() * workTexts.length)]

        return await replyWithEmbed(
            interaction, `You earned :dollar: **${num.toLocaleString()}** by ${workMessage}`,
            `#00ff00`, `:green_circle: Work`
        )

        const cooldownEnd = Date.now() + cooldownTime;

        if (cooldownData) {
            cooldownData.cooldownEnd = cooldownEnd
            await cooldownSchema.save()
        } else {
            await new cooldownSchema({
                userID: user.id,
                command: 'work',
                cooldownStart: Date.now(),
                cooldownEnd: cooldownEnd
            }).save();
        }

        setTimeout(async () => {
            await cooldownSchema.deleteOne({userID: user.id})
        }, cooldownTime);
    }
}
