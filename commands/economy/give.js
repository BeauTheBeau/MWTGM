const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../../models/user.js");

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

    /* DOCUMENTATION
      * ==========================================================
      * Arnav: best command for people who don't have money to give 5% tax
      * Beau: I LOVE TAXES
      * Arnav: SAME! (TAKES SCREENSHOT)
      * Beau: (ALSO TAKES SCSREENSHOT)
      * ==========================================================
      * DOCUMENTATION END */
    async execute(interaction, client) {
        const { options, user } = interaction;
        const target = interaction.options.getMember(`target`);
        let userData, targetData, amount;

        try {
            const younotallowed = new EmbedBuilder()
              .setDescription(`***:warning: You cannot donate cash to yourself***`)
              .setColor(`Red`)
            if(target.id === interaction.user.id) return interaction.reply({embeds: [younotallowed], ephemeral: true})

            userData = await userModel.findOne({ userID: user.id });
            targetData = await userModel.findOne({ userID: target.id });

            if (!userData) {
                const noprofile = new EmbedBuilder()
                    .setDescription(`***:warning: You don\'t have a profile yet***`)
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


        } catch (e) {
            console.log(e.stack)
            return await interaction.reply({
                content: "There was an error retrieving the profile data of you or the target",
                ephemeral: true
            })
        }

        amount = options.getInteger("amount");
        if (!userData.cash) return interaction.reply("***:warning: You don't have enough money to giveaway!***")

        try {
            userData.cash -= amount;
            targetData.cash += amount;
            await userData.save()
            await targetData.save()
        } catch (e) {
            console.error(e.stack)
            return interaction.reply({
                content: "***:warning: Failed to save balance.***",
                epemeral: true
            })
        }

        const embed = new EmbedBuilder()
            .setTitle(`${user.username} donated to ${target.user.username}`)
            .setDescription(`***Donated ${amount} to <@${target.user.id}>.***`)
            .setColor(`Green`)
            .setTimestamp()

        return interaction.reply({
            content: `<@${target.id}>!`,
            embeds: [embed]
        })
    }
}
