const { ActivityType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        const guild = client.guilds.cache.get(`1116901298239975515`)
      
      /* ⬇️ removing cool down from a channel because gamergod annoying ⬇️ */
        const removeCooldown = async () => {
            const channel = guild.channels.cache.get('1122282979088142406');          
            channel.setRateLimitPerUser(0)
            console.log(`Cooldown removed from ${channel.name}`); 
        }; 
        removeCooldown().catch(err => { console.log(err)});
      /* ⬆️ removing cool down from a channel because gamergod annoying ⬆️ */
      
        const statusArray = [
            {
                type: ActivityType.Playing,
                content: "Gamenights",
            },
            {
                type: ActivityType.Watching,
                content: "Factions around MWT",
            },
            {
                type: ActivityType.Watching,
                content: `over ${guild.memberCount} members in MWT GNs!`,
            },
        ];

        async function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);
            client.user.setStatus("idle");
            try {
                await client.user.setPresence({
                    activities: [
                        {
                            name: statusArray[option].content,
                            type: statusArray[option].type,
                        },
                    ],
                });
            } catch (error) {
                console.error(error);
            }
        }

        setInterval(pickPresence, 8 * 1000);
        console.log(`${client.user.username} is now up and running`);
    },
};
