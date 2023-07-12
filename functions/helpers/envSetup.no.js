require(`dotenv`).config();
const fs = require(`fs`);

/**
 * @name: envSetup
 * @description: Check if .env variables for the bot exist. If not, create them.
 * @param {string} TOKEN - The bot token
 * @param {string} MONGO_URI - The MongoDB URI
 * @param {string} CLIENT_ID - The client ID of the bot
 * @param {boolean} dev - Whether the bot is in development mode
 */

module.exports = (token, mongoURI, clientId, dev) => {
  if (!process.env.TOKEN) {
    console.log(`No token provided. Please add a token to your .env file.`);
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.log(`No MongoDB URI provided. Please add a MongoDB URI to your .env file.`);
    process.exit(1);
  }

  if (!process.env.CLIENT_ID) {
    console.log(`No client ID provided. Please add a client ID to your .env file.`);
    process.exit(1);
  }

  if (process.env.dev) {
    console.log(`Running in development mode.`);
  }

  if (!fs.existsSync(`./.env`)) {
    console.log(`No .env file found. Creating one now.`);
    fs.writeFileSync(`./.env`, `TOKEN=${token}\nMONGO_URI=${mongoURI}\nCLIENT_ID=${clientId}\nDEV=${dev}`);
  }

  console.log(`.env file found. Loading variables.`);

  return {
    token: process.env.TOKEN,
    mongoURI: process.env.MONGO_URI,
    clientId: process.env.CLIENT_ID,
    dev: process.env.DEV
  };
};


