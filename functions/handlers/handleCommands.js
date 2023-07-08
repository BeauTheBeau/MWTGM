const { REST } = require(`@discordjs/rest`);
const { Routes } = require(`discord-api-types/v9`);
const client = require(`../../index.js`);
const fs = require("fs");
const ascii = require("ascii-table");
const chalk = require('chalk')
const table = new ascii().setHeading("Commands", "Status");
const Token = process.env.TOKEN

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

        const clientId = process.env.CLIENT_ID
        const rest = new REST({ version: "9" }).setToken(Token);
        try {
            await rest.put(Routes.applicationCommands(clientId), {
                body: client.commandArray,
            });
            console.log(chalk.blue(`Successfully reploaded application (/) commands.`));
        } catch (error) {
            console.error(error);
        }
        
    };
}
