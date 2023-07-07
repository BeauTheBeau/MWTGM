const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../../models/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check the balance of a specific User or yourself")
        .setDMPermission(false)
        .addUserOption(user => user
            .setName('user')
            .setDescription('Select the user')
        ),
    async execute(interaction, client) {
        const { options } = interaction;
        const user = options.getMember('user') || interaction.user;
        let userData;

        try {
            userData = await userModel.findOne({ userID: user.id });

            if (!userData) {
                const noprofile = new EmbedBuilder()
                  .setDescription(`***:warning: ${user.username || user.user.username} doesn\'t have a profile yet***`)
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

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag || user.user.tag}'s balance`)
            .addFields({name: `🏦 Bank`, value: `${userData.bank}`, inline: true})
            .addFields({name: `💰 Cash`, value: `${userData.cash}`, inline: true})
            .setColor(`Green`)
            .setTimestamp()

        return interaction.reply({
            embeds: [embed]
        })

    }
}
