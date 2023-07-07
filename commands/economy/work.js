const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
            const cooldownEmbed = new EmbedBuilder()
                .setColor(`Red`)
                .setDescription(`:warning: ***You are on cooldown, the cooldown will end <t:${remainingTimeUnix}:R>***`)
            return interaction.reply({embeds: [cooldownEmbed], ephemeral: true});
        }
        try {
            userData = await userModel.findOne({ userID: user.id });

            if (!userData) {
                const noprofile = new EmbedBuilder()
                    .setDescription(`**:warning: You don\'t have a profile yet**`)
                    .setColor(`Red`)
                return await interaction.reply({
                    embeds: [noprofile],
                    ephemeral: true
                })
            }

        } catch (e) {
            console.log(e.stack)
            return await interaction.reply({
                content: "There was an error retrieving your profile data",
                ephemeral: true
            })
        }

        const
            min = 100,
            max = 10000,
            num = Math.round(Math.random() * (max - min + 1), 2);

        try {
            userData.cash += num;
            await userData.save()
        } catch (e) {
            console.error(e.stack)
            return interaction.reply({
                content: "**:warning: Failed to add money to your balance**",
                epemeral: true
            })
        }

        const workMessage = workTexts[Math.floor(Math.random() * workTexts.length)]

        const embed = new EmbedBuilder()
            .setTitle(`${user.username} has earned for working!`)
            .setDescription(`***You have earned 💰${num} for ${workMessage} now you have 💰${userData.cash} in cash***`)
            .setColor(`Green`)

        interaction.reply({
            embeds: [embed]
        });

        const cooldownEnd = Date.now() + cooldownTime;

        if (cooldownData) {
            cooldownData.cooldownEnd = cooldownEnd
            await cooldownSchema.save()
        } else {
            const newCooldownData = new cooldownSchema({
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
