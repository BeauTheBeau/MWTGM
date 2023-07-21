require('dotenv').config()

const { REST } = require(`@discordjs/rest`);
const { Routes } = require(`discord-api-types/v9`);
const fs = require("fs");
const chalk = require('chalk')
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
                let startTime2 = Date.now();
                const command = require(`../../commands/${folder}/${file}`);
                if (command.data.name) await commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                console.log(`${chalk.blue(`> [${chalk.green(`${Date.now() - startTime2}ms`)}] Loaded command `)}${chalk.green(`${command.data.name}`)}`);
            }
        }

        console.log(`${chalk.blue(`> Loaded commands in `) + chalk.green(`${Date.now() - startTime}ms`)}`);
        console.log()

        const clientId = process.env.CLIENT_ID
        const rest = new REST().setToken(token);

        try {
            console.log(chalk.blue(`Started refreshing ${chalk.green(`${client.commandArray.length}`)} application (/) commands.`));
            startTime = Date.now();
            await rest.put(Routes.applicationCommands(clientId), {
                body: client.commandArray,
            });
            console.log(chalk.blue(`> Successfully reloaded application (/) commands in `) + chalk.green(`${Date.now() - startTime}ms`));
        } catch (error) {
            console.error(error);
        }
    };
}