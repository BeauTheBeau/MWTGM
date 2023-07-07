const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../../models/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Deposit money into your bank")
        .setDMPermission(false)
        .addIntegerOption(option => option
            .setName("amount")
            .setDescription("Defaults to all, number of mouney you want to deposit")
        ),
    async execute(interaction, client) {
        const { user } = interaction;
        let userData, amount;

        try {

            userData = await userModel.findOne({ userID: user.id });

            if (!userData) {
                const noprofile = new EmbedBuilder()
                    .setDescription(`***:warning: You don\'t have a profile yet***`)
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

        amount = interaction.options.getInteger("amount") || userData.cash;
        if (amount > userData.cash) return interaction.reply("***:warning: You don't have enough money to do this.***")

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
            return interaction.reply({
                content: "**:warning: Failed to save balance.**",
                epemeral: true
            })
        }

        const embed = new EmbedBuilder()
            .setTitle(`${user.username} deposited ${amount}`)
            .setDescription(`***Deposited ${amount} into your bank. A 5% fee was taken***`)
            .setColor(`Green`)
            .setTimestamp()

        return interaction.reply({
            embeds: [embed], ephemeral: false
        })
    }
}
