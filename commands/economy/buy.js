const {SlashCommandBuilder} = require("discord.js");
const userModel = require("../../models/userModel.js");
const {replyWithEmbed} = require("../../functions/helpers/embedResponse.no")
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

    async execute(interaction) {
        const {user} = interaction;
        let userData;

        try {
            userData = await userModel.findOne({userID: user.id});

            if (!userData) return await replyWithEmbed(
                interaction, `This user does not have a profile yet!`,
                `#ff0000`, `:red_circle: Error`
            )

            // If channel isnt in shop
            if (!shop[interaction.channel.id]) return await replyWithEmbed(
                interaction, `This channel does not have a picture for sale.`,
                `#ff0000`, `:red_circle: Error`
            )
            

            if (userData.cash < shop[interaction.channel.id][0]) return await replyWithEmbed(
                interaction, `You do not have enough :dollar: cash to buy this picture.`,
                `#ff0000`, `:red_circle: Error`
            )

        } catch (e) {
            console.log(e.stack)
            return await replyWithEmbed(
                interaction, `An error occurred while trying to find this user's data.`,
                `#ff0000`, `:red_circle: Error`
            )
        }
    }
}