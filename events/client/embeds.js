const { ActivityType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        // const guild = client.guilds.cache.get(`1116901298239975515`)
        //
        // const nationalityruleschannel = guild.channels.cache.get(`1122370104378802276`);
        // const nationalityrules = new EmbedBuilder()
        //   .setTitle(`Rules of Nationality and Culture`)
        //   .setDescription(`Follow the rules below and obey it`)
        //   .addFields({name: `1. No hate speech`, value: `Hate speech is strictly prohibited.`})
        //   .addFields({
        //     name: `2. Spamming prevention`,
        //     value: `Spam is allowed, but only emojis that associate with the side that you align with, and not in ⁠<#1120032896045027388> or ⁠<#1122279561699270756> . Be careful though, as carl-bot will still moderate spam, so try not to send more than 3 messages a second`
        //   })
        //   .addFields({
        //     name: `3. Server rules apply here too`,
        //     value: `These rules are exclusive to these channels. ⁠<#1116910747054772264> also applies here though, other than the obvious "no spamming" one`
        //   })
        //   .setColor(`White`)
        //await nationalityruleschannel.send({embeds: [nationalityrules]})
    }
}