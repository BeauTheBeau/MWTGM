const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        const guild = client.guilds.cache.get(`1116901298239975515`)
        if (!guild) return // If bot not in server

        const statusArray = [
            {
                type: ActivityType.Playing,
                content: "game nights",
            },
            {
                type: ActivityType.Watching,
                content: "factions in MWT",
            },
            {
                type: ActivityType.Watching,
                content: `over ${guild.memberCount} members `,
            },
        ];

        async function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);
            client.user.setStatus("online");
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
