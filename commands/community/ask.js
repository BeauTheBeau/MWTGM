const {replyWithEmbed} = require("../../functions/helpers/embedResponse")
const {SlashCommandBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`ask`)
        .setDescription(`Contact our generative machine learning overlords.`)
        .addStringOption(option => option
            .setName(`question`)
            .setDescription(`The question you want to ask.`)
            .setRequired(true)
        ),

    async execute(interaction) {

        const {options, user} = interaction;
        const question = options.getString(`question`);
        const context = `It is ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString()}.` +
            `${user.username} asked: ${question} in the ${interaction.channel.name} channel which is in the ` +
            `${interaction.guild.name} server.`;
        const requestURL = "http://144.21.50.86:5000/ask?question=" + context.replace(/ /g, "%20");

        await replyWithEmbed(
            interaction, `Your question: ${question}`,
            `#0000ff`, `:blue_circle: Fetching answer!`
        )

        try {
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            const response = await fetch(requestURL);
            const data = await response.json();


            if (data.status !== "200") {
                return await replyWithEmbed(
                    interaction, data.error,
                    `#ff0000`, `:red_circle: Error`
                )
            }

            const answer = data.answer;
            await replyWithEmbed(
                interaction, answer,
                `#00ff00`, `:green_circle: Success`
            )
        } catch (e) {
            console.log(e.stack)
            return await replyWithEmbed(
                interaction, `Something went wrong!`,
                `#ff0000`, `:red_circle: Error`
            )
        }
    }
}
