const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userModel = require("../../models/userModel.js");

const shop = {
    // CHANNEL ID : [ PRICE, IMAGE ]
    "1117577834471370812": [0, `https://source.unsplash.com/featured/1920x1080/?poutine`],
    "1117516098833752185": [250, `https://source.unsplash.com/featured/1920x1080/?croissant`],
    "1117516057163354153": [750, `https://source.unsplash.com/featured/1920x1080/?pizza`],
    "1117517600906289232": [1000, "https://source.unsplash.com/featured/1920x1080/?tea"],
    "1117515857577390161": [500, "https://source.unsplash.com/featured/1920x1080/?knife"],
    "1117515551749709844": [500, "https://source.unsplash.com/featured/1920x1080/?gun"]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Buy a picture")
        .setDMPermission(false),

    async execute(interaction, client) {
        const { options, user } = interaction;
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

        if (userData.cash < shop[interaction.channel.id][0]) return interaction.reply("***:warning: You don't have enough money to buy that!***")
    }
}