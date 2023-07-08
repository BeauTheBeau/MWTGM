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
        const question = options.getString(`question`).replace(" ", "+");

        const context = `The user is ${user.username}#${user.discriminator} with ID ${user.id}. `
            + `The user is in the ${interaction.guild.name} server with ID ${interaction.guild.id} and the ${interaction.channel.name} channel with ID ${interaction.channel.id}. `
            + `We are on Discord. `
            + `You are the ${interaction.client.user.username} bot with ID ${interaction.client.user.id}, which is running on the ${process.platform} operating system and `
            + `the ${process.arch} architecture. It is using Node.js version ${process.version}. `
            + `The bot description is "I'm a bot for a server called MWT Gamenights!". `
            + `The MWT Gamenights server description follows, `
            + `# MWT Gamenights & Minecraft Server`
            + `## This server is an unofficial Gamenights server for MWT Players.`
            + `## Features`
            + `- We have gamenights. Gamenights are events that happen occasionally, in which players who join have to play games based on voting outcomes. `
            + `- We also have a Nationality & Culture Category. Ever wanted to fight against other countries without being political, or without being a terrorist? You can fight against country's favorite dishes instead`
            + `- We even have plans to make a minecraft server, though its only planned and cannot be guaranteed to come into fruition, it most likely will!`
            + `## Other Notes`
            + `- Rules are nearly identical to the main Stealth Developers discord server. This means if you wouldnt post it there, dont post it here either. `
            + `- If you are Banned in stealth developers, you will be subsequently banned here as well.`
            + `- This isnt really a faction, so i asked explicitly for permission to post this, and i got said permission from Sticksdacta.`
            + `## Invite`
            + `https://discord.gg/cgHG7Z7FGe . `
            + `The time is ${new Date}. `
            + `You can format your message with Discord's Mardkdown. Do **<TEXT>** for bold, *<TEXT>* for italics and `
            + `__<TEXT>__ for underline. You can also use Markdown headers with #.`
            + `It also supports code blocks with \`\`\`<LANGUAGE>\n<CODE>\n\`\`\` - ALWAYS use this when asked to send code. `
            + `You can also use inline code blocks with \`<CODE>\``
            + `You can also use blockquotes with > <TEXT>.`
            + `You can also use lists with - <TEXT> or 1. <TEXT>.`
            + `You can also use links with <https://example.com> or [Example](https://example.com).`
            + `You can also use emojis with :<EMOJI NAME>:.`;


        await replyWithEmbed(
            interaction, `Your question: ${question}`,
            `#0000ff`, `:blue_circle: Fetching answer!`
        )

        try {
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

            const requestURL = "http://144.21.50.86:5000/ask";
            let data = fetch(`${requestURL}`, {
                method: 'POST',
                body: JSON.stringify({
                    question: question,
                    context: context
                }),
                headers: {'Content-Type': 'application/json'}
            })
                .then(res => res.json())
                .then(async json => {
                    return json;
                })
                .catch(err => console.error(`Err`))

            data = await Promise.resolve(data)

            if (data.status !== "200") {
                return await replyWithEmbed(
                    interaction, `Encountered an error: ${data.status} ${data.error}`,
                    `#ff0000`, `:red_circle: Error`
                )
            }


            const answer = data.answer;
            await replyWithEmbed(
                interaction, `A${answer}`,
                `#00ff00`, `:green_circle: Success`
            )
        } catch (e) {
            console.log(`Error`)
            console.log(e.stack)
            return await replyWithEmbed(
                interaction, `Something went wrong!`,
                `#ff0000`, `:red_circle: Error`
            )
        }
    }
}
