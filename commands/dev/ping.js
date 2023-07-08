const {SlashCommandBuilder} = require("discord.js");
const replyWithEmbed = require("../../functions/helpers/embedResponse");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the API Latency and Client ping")
        .setDMPermission(false),
    async execute(interaction, client) {

        const ping = interaction.client.ws.ping;
        const apiLatency = Date.now() - interaction.createdTimestamp;

        return await replyWithEmbed(interaction, `API Latency: ${apiLatency}ms\nClient Ping: ${ping}ms`, "#00ff00", ":ping_pong: Pong!");
    }
};