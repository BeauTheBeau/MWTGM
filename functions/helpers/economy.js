/**
 * @module economy
 * @description Economy related functions such as adding and removing money
 * @category economy
 */

const userModel = require(`../../models/userModel.js`)

/**
 * @function addMoney
 * @description Adds money to a user's balance
 * @param {String} userID - The ID of the user
 * @param {Number} amount - The amount of money to add
 * @returns {Promise<void>}
 */

async function addMoney (userID, amount) {

  try {
    const user = await userModel.findOneAndUpdate(
      { userID: userID },
      { $inc: { cash: amount } },
      { new: true, upsert: false, runValidators: true }
    )

    if (!user) throw new Error('User not found')

    return user;

  } catch (e) {
    console.error(e.stack)
    throw e
  }
}


