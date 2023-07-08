const { REST } = require(`@discordjs/rest`);
const { Routes } = require(`discord-api-types/v9`);
const fs = require("fs");
const ascii = require("ascii-table");
const chalk = require('chalk')
const table = new ascii().setHeading("Commands", "Status");
require('dotenv').config()
const token = process.env.token

module.exports = (client) => {
    client.handleCommands = async () => {
        
        const commandFolders = fs.readdirSync(`./commands`);
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./commands/${folder}`)
                .filter((file) => file.endsWith(`.js`));
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                if (command.data.name) {
                    commands.set(command.data.name, command);
                    table.addRow(file, "Working");
                }
                commandArray.push(command.data.toJSON());
            }
        }
        console.log(table.toString());

        const clientId = "1117584872404426842";
        const guildId = "1116901298239975515";
        const rest = new REST({ version: "9" }).setToken(token);
        try {
            await rest.put(Routes.applicationCommands(clientId, guildId), {
                body: client.commandArray,
            });
            console.log(chalk.blue(`Successfully reploaded application (/) commands.`));
        } catch (error) {
            console.error(error);
        }
        
    };
}