//########################################
//##### UTILITY FOR MONGODB DATABASE #####
//########################################


// update status bot
  async function UpdateStatus(client, nameOfListing, updatedListing) {

    const result = await client.db("test").collection("bots").updateOne({ name: nameOfListing }, { $set: updatedListing });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);

    console.log(`${result.modifiedCount} document(s) was/were updated.`);

}


// add name of the bot speaking with user
async function updateUser(client, nameOfListing, updatedListing) {

  const result = await client.db("test").collection("users").updateOne({ username: nameOfListing }, { $set: updatedListing });

  console.log(`${result.matchedCount} document(s) matched the query criteria.`);

  console.log(`${result.modifiedCount} document(s) was/were updated.`);

}


// FIND active bots on a specific platform
// sort _id = 1 impose a ascendind order --> at the top the ones added most recently
async function findActiveBot(client, platform) {
  const cursor = await client.db("test").collection("bots").find({ status: "on", platform: platform }).sort({ _id: 1 });

  var results = await cursor.toArray();

  if (results.length > 0) {

    console.log(`Found active bot(s) on ${platform}`);

    results.forEach((result, i) => {

      console.log(`${i + 1}. name: ${result.name}`);

    });

  } else {

    console.log(`No active bots found on ${platform}`);
    results = -1;

  }
  return results;
}

// find active bots by name
async function findActiveBotName(client, name, platform) {
  const cursor = await client.db("test").collection("bots").find({ name: name, status: "on", platform: platform });

  var results = await cursor.toArray();

  if (results.length > 0) {

    console.log(`Found active bot(s) ${name} on ${platform}`);

  } else {

    console.log(`No active bots found with name ${name} on ${platform}`);
    results = -1;

  }
  return results;
}

// FIND bots per names
async function findBotName(client, botName) {
  const result = await client.db("test").collection("bots").findOne({ name: botName });
  if (result) {
    console.log(`Found a bot in the collection with the name '${botName}':`);
    console.log(result);
  } else {
    console.log(`No bot with the name '${botName}'`);
  }
  return result;
}


// FIND all bots
async function findBots(client) {
  const cursor = await client.db("test").collection("bots").find();
  var results = await cursor.toArray();

  if (results.length > 0) {

    console.log(`Found bot(s):`);

    results.forEach((result, i) => {


      console.log(`${i + 1}. name: ${result.name}`);

    });

  } else {

    console.log(`No bots found`);
    results == -1;

  }

  return results;
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
async function DatabaseConnectionOpen(client) {
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
async function DatabaseConnectionClose(client) {
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
module.exports = { findBots, findBotName, findActiveBot, findActiveBotName, findOneListingByName, DatabaseConnectionOpen, DatabaseConnectionClose, UpdateStatus, updateUser };