require('dotenv').config()

const { REST } = require(`@discordjs/rest`);
const { Routes } = require(`discord-api-types/v9`);
const fs = require("fs");
const ascii = require("ascii-table");
const chalk = require('chalk')
const table = new ascii().setHeading("Commands", "Status");
const token = process.env.TOKEN

let startTime;

module.exports = (client) => {
    client.handleCommands = async () => {

        startTime = Date.now();
        console.log(`${chalk.blue(`Loading commands...`)}`);

        const commandFolders = fs.readdirSync(`./commands`);
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./commands/${folder}`)
                .filter((file) => file.endsWith(`.js`));
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                console.log(`${chalk.blue(`> Loading ${file}`)}`);
                const command = require(`../../commands/${folder}/${file}`);
                if (command.data.name) {
                    await commands.set(command.data.name, command);
                    table.addRow(file, "Working");
                }
                commandArray.push(command.data.toJSON());
            }
        }
        console.log(table.toString());

        console.log(`${chalk.blue(`> Loaded commands in `) + chalk.green(`${Date.now() - startTime}ms`)}`);

        const clientId = process.env.CLIENT_ID
        const rest = new REST().setToken(token);

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