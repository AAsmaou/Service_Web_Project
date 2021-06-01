//########################################
//##### UTILITY FOR MONGODB DATABASE #####
//########################################


// INSERT a bot into activeBots
async function MarkBotAsRunning(client, newListing){

  const result = await client.db("test").collection("activeBots").insertOne(newListing);

  console.log(`New listing created with the following id: ${result.insertedId}`);

}

// FIND bots
async function findActiveBot(client, platform) {
  const result = await client.db("test").collection("activeBots").findOne({ platform: platform});
  if (result) {
      console.log(`Found a bot running on '${platform}':`);
      console.log(result);
  } else {
      console.log(`No bot running on '${platform}'`);
  }
  return result;
}

// FIND bots
async function findBotName(client, botName) {
  const result = await client.db("test").collection("bots").findOne({ name: botName});
  if (result) {
      console.log(`Found a bot in the collection with the name '${botName}':`);
      console.log(result);
  } else {
      console.log(`No bot with the name '${botName}'`);
  }
  return result;
}

// FIND USERS
async function findOneListingByName(client, user, password) {

  const result = await client.db("test").collection("users").findOne({ username: user, psw: password });

  if (result) {

      console.log(`Found a listing in the collection with the name '${user}':`);

      console.log(result);

  } else {

      console.log(`No listings found with the name '${user}'`);

  }

  return result;
}


// OPEN DATABASE CONNECTION
async function DatabaseConnectionOpen(client){
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */

  try {
      // Connect to the MongoDB cluster
      await client.connect();

      console.log("DATABASE CONNECTED SUCCESSFULLY");

  } catch (e) {
      console.error(e);
  }
}

// CLOSE DATABASE CONNECTION
async function DatabaseConnectionClose(client){
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */

  try {
      // Close connection to the MongoDB cluster
      await client.close();

      console.log("DATABASE CONNECTION CLOSE SUCCESSFULLY");

  } catch (e) {
      console.error(e);
  }
}

// exports functions
module.exports = { findBotName, findActiveBot, findOneListingByName, DatabaseConnectionOpen, DatabaseConnectionClose, MarkBotAsRunning };