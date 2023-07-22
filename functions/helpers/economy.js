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
 * @param bank
 * @returns {Promise<void>}
 */

async function addMoney (userID, amount, bank = false) {

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

/**
 * @function removeMoney
 * @description Removes money from a user's balance
 * @param {String} userID - The ID of the user
 * @param {Number} amount - The amount of money to remove
 * @param bank
 * @returns {Promise<void>}
 * @throws {Error} - If the user is not found
 * @throws {Error} - If the user does not have enough money
 */

async function removeMoney (userID, amount, bank = false

    try {
      const user = await userModel.findOneAndUpdate(
        { userID: userID },
        { $inc: { cash: -amount } },
        { new: true, upsert: false, runValidators: true }
      )

      if (!user) throw new Error('User not found')
      if (user.cash < 0) throw new Error('User does not have enough money')

      return user;

    } catch (e) {
      console.error(e.stack)
      throw e
    }
}

/**
 *
 */
