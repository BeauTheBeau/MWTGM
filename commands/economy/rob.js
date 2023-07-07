const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../../models/user.js");

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
    async execute(interaction, client) {
        const { options, user } = interaction;
        const target = interaction.options.getMember(`target`);
        let userData, targetData, amount;

        try {

            userData = await userModel.findOne({ userID: user.id });
            targetData = await userModel.findOne({ userID: target.id });
            
            if (!userData) {
                const noprofile = new EmbedBuilder()
                    .setDescription(`***:warning: You doesn\'t have a profile yet***`)
                    .setColor(`Red`)
                return await interaction.reply({
                    embeds: [noprofile],
                    ephemeral: true
                })
            }

            
            if (!targetData) {
                const noprofile = new EmbedBuilder()
                    .setDescription(`***:warning: ${target.user.username} doesn\'t have a profile yet***`)
                    .setColor(`Red`)
                return await interaction.reply({
                    embeds: [noprofile],
                    ephemeral: true
                })
            }
            if(!targetData.cash) {
              const nocash = new EmbedBuilder()
                    .setDescription(`***:x: ${target.user.username} doesn\'t have any cash***`)
                    .setColor(`Red`)
                return await interaction.reply({
                    embeds: [nocash],
                    ephemeral: true
                })
            }
            
            
        } catch (e) {
            console.log(e.stack)
            return await interaction.reply({
                content: "There was an error retrieving the profile data of you or the target",
                ephemeral: true
            })
        }

        amount = Math.round(Math.random() / 2 * targetData.cash, 2);

        try {
            targetData.cash -= amount;
            userData.cash += amount;
            await userData.save()
            await targetData.save()
        } catch (e) {
            console.error(e.stack)
            return interaction.reply({
                content: "**:warning: Failed to save balance.**",
                epemeral: true
            })
        }

        const embed = new EmbedBuilder()
            .setTitle(`${user.username} stole from ${target.user.username}`)
            .setDescription(`***you have stole ${amount} of cash💰 from ${target.user.username}.***`)
            .setColor(`Green`)
            .setTimestamp()

        return interaction.reply({
            content: `<@${target.id}>!`,
            embeds: [embed]
        })
    }
}
