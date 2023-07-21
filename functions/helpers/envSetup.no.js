require(`dotenv`).config()
const fs = require(`fs`)
const chalk = require('chalk')

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
    console.log(`${chalk.red(`No token provided. Please add a token to your .env file.`)}`)
    process.exit(1)
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.log(`${chalk.red(`No Unsplash access key provided. Please add a Unsplash access key to your .env file.`)}`)
    process.exit(1)
  }

  if (!process.env.UNSPLASH_SECRET_KEY) {
    console.log(`${chalk.red(`No Unsplash secret key provided. Please add a Unsplash secret key to your .env file.`)}`)
    process.exit(1)
  }

  if (!process.env.MONGO_URI) {
    console.log(`${chalk.red(`No MongoDB URI provided. Please add a MongoDB URI to your .env file.`)}`)
    process.exit(1)
  }

  if (!process.env.CLIENT_ID) {
    console.log(`${chalk.red(`No client ID provided. Please add a client ID to your .env file.`)}`)
    process.exit(1)
  }

  if (!fs.existsSync(`./.env`)) {
    console.log(`${chalk.yellow(`.env file not found. Creating one.`)}`)
    fs.writeFileSync(`./.env`,
      +`TOKEN=${token}\nMONGO_URI=${mongoURI}\n`
      + `CLIENT_ID=${clientId}\n`
      + `DEV=${dev},\n`
      + `DEBUG=false\n`
      + `UNSPLASH_ACCESS_KEY=${process.env.UNSPLASH_ACCESS_KEY}\n`
      + `UNSPLASH_SECRET_KEY=${process.env.UNSPLASH_SECRET_KEY}`)
  }

  if (process.env.DEBUG) console.log(`${chalk.yellow(`Debug mode is enabled.\nThis is not recommended for production.`)}`)
  console.log(`${chalk.green(`.env file found.`)}`)

  return {
    token: process.env.TOKEN,
    mongoURI: process.env.MONGO_URI,
    clientId: process.env.CLIENT_ID,
    debug: process.env.DEBUG,
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    unsplashSecretKey: process.env.UNSPLASH_SECRET_KEY
  }
}


