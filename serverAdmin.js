console.log("Server inialization... ");

//**************************************************/
//************ DATABASE CONNECTION ****************/ 
//**************************************************/
var tools = require('./model/DatabaseUtility');

// establish database connection
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://gas:WebProject@cluster0.gsyew.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true });
tools.DatabaseConnectionOpen(client).catch(console.error);


//**************************************************/
//************ INITIALIZE APP **********************/ 
//**************************************************/

const express = require('express')
const app = express()
const port = 3001

//set the view engine as ejs
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// listen Admin service
app.listen(port, () => {
  console.log(`AdminService listening at http://localhost:${port}`)
})

//********************************************************/
//************ RETRIEVE .rive FILES **********************/ 
//********************************************************/

var fs = require('fs');
var files = fs.readdirSync('./brain');

//**************************************************/
//********** RIVESCRIPT INITIALIZATION *************/ 
//**************************************************/
const RiveScript = require('rivescript');
var bot = new RiveScript();


//**************************************************/
//************ DISCORD INITIALIZATION *************/ 
//**************************************************/

// require the discord.js module
const Discord = require('discord.js');

// create a new Discord client
const clientDiscord = new Discord.Client();



//**********************************************************/
//************ GET: DISPLAY ADMIN INTERFACE ***************/ 
//*********************************************************/

app.get('/', (req, res) => {

  var BotOnDiscord = [];
  var bots = [];


  // FIND ACTIVE BOTS ON DISCORD
  tools.findActiveBot(client, 'Discord').then((val) => {
    if (val == -1) {
      BotOnDiscord = -1;
    }
    else {
      BotOnDiscord = val;
    }
    // FIND ALL BOTS
    tools.findBots(client).then((val) => {
      if (val == -1) {
        bots = -1;
      }
      else {
        bots = val;
      }
      res.render('admin', { results: bots, filelist: files, DiscordBot: BotOnDiscord });
    });
  });
});


//*********************************************************************/
//************ POST: LAUNCH BOTS on Discord or Browser ***************/ 
//*********************************************************************/

//use case: select the name of the bot from a list and send it to the chatroom
app.post('/', function (req, res) {
  // Send Name Chatbot
  var botName = req.body.BotName;
  var platform = req.body.interface;
  var brainFile = req.body.brain;

  //********************************
  //********** BROWSER *************
  //********************************
  // Launch bot on the browser. 
  //We set up the bot as launched on the database. The bot is launched in the serverBot.js after checking it has been initialized as launched on the database


  // check if botName is already running
  if (platform == "Browser") {
    tools.findActiveBotName(client, botName, platform).then((val) => {
      if (val == -1) {

        tools.UpdateStatus(client, botName, { status: 'on', platform: platform, brains: brainFile });
        console.log("Bot launched");

      }
      else {
        console.log("Bot already running");
      }
      // update interface 
      res.redirect('http://localhost:' + port);
    });
  }

  //*********************************************************
  //********** LAUNCH BOT ON DISCORD ************************
  //*********************************************************
  else if (platform == "Discord") {

    tools.findActiveBotName(client, botName, platform).then((val) => {
      if (val == -1) {
        tools.UpdateStatus(client, botName, { status: 'on', platform: platform, brains: brainFile });

        // store in the database the name of the robot with whom the user is speaking
        // TO DO: retrieve the same name of the user on Discord
        tools.updateUser(client, "user2", {bot : botName});

        // initialize rivescript bot 
        bot = new RiveScript();
        bot.loadFile("brain/" + brainFile).then(launchOnDiscord(botName)).catch(error_handler);
      }
      else {
        console.log("Bot already running");
      }
      // update interface 
      res.redirect('http://localhost:' + port);
    });

  }
  //*********************************************************
  //********** LAUNCH BOT ON SLACK ************************
  //*********************************************************
  else if (platform == "Slack") {

    tools.findActiveBotName(client, botName, platform).then((val) => {
      if (val == -1) {
        tools.UpdateStatus(client, botName, { status: 'on', platform: platform, brains: brainFile });

        // initialize rivescript bot 
        bot = new RiveScript();
        bot.loadFile("brain/" + brainFile).then(launchOnSlack(botName)).catch(error_handler);
      }
      else {
        console.log("Bot already running");
      }
      // update interface 
      res.redirect('http://localhost:' + port);
    });

  }

});


// URL for connecting bot to your server: https://discord.com/api/oauth2/authorize?client_id=850311681304821770&permissions=8&scope=bot
async function launchOnDiscord(name) {
  
  const config = require("./config.json");

  // try to see it works

  // when the client is ready, run this code
  // this event will only trigger one time after logging in
  clientDiscord.once('ready', () => {
    // set bot name
    clientDiscord.user.setUsername(name);
    console.log("Bot ready on Discord");
  });

  // read messages sent by the user and reply to them
  clientDiscord.on('message', message => {
    if (!message.author.bot) {   // To avoid the bot replies to himself

    // get name of the other username
    var UserName = message.author.username;
    var UserMsg = message.content;

    //generate reply by bot
    bot.sortReplies();

    bot.reply(UserName, UserMsg).then(function (reply) {
      console.log("The bot says: " + reply);
      message.channel.send(reply);
    });
  }
  });



// require the slack client
const Slack = require("slack-client");
require("babel-polyfill");
var config = require("./config.json");
// create a new Slack client
const clientSlack = new Slack(config.token, true, true);

async function launchOnSlack(name) {
  
	clientSlack.on("open", function() {
		console.log("Welcome to Slack. You are %s of %s",
			clientSlack.self.name, clientSlack.team.name);
	});

  clientSlack.on('message', function(data) {
    // get name of the other username
    var UserName = data._client.author.username;
    var UserMsg = data.toJSON;

    //generate reply by bot
    bot.sortReplies();

    bot.reply(UserName, UserMsg).then(function (reply) {
      console.log("The bot says: " + reply);	
      // Send it to the channel.
      channel = slack.getChannelGroupOrDMByID(messageData.channel);
      if (reply.length > 0) {
        channel.send(reply);
      }
    });
  
  });
}


//******************************************/
//******** UTILITY FOR LOADING BRAIN *******/ 
//******************************************/

function error_handler(loadcount, err) {
  console.log("Error loading batch #" + loadcount + ": " + err + "\n");
}


//******************************************/
//******** DISABLE BOT FROM DISCORD *******/ 
//******************************************/
var methodOverride = require('method-override')

// override with POST having ?_method=DELETE
app.use(methodOverride('_method', ['DELETE']))


app.delete('/remove', function (req, res) {
  var botName = req.body.BotName;

  tools.findActiveBotName(client, botName, "Discord").then((val) => {
    if (val != -1) {  // if bot is really running on Discord, then disconnect it

      // disconnect bot
      if (clientDiscord.user.username == botName) {

        clientDiscord.destroy();

        console.log(botName + " has been disconnected from Discord");
      }

      tools.UpdateStatus(client, botName, { status: 'off', platform: 'Discord', brains: "null" });
    }
    else {
      console.log("Bot not running on Discord");
    }
    res.redirect('http://localhost:' + port);
  });
})

//******************************************/
//******** DISABLE BOT FROM SLACK *******/ 
//******************************************/
app.delete('/remove', function (req, res) {
  var botName = req.body.BotName;

  tools.findActiveBotName(client, botName, "Slack").then((val) => {
    if (val != -1) {  // if bot is really running on Slack, then disconnect it

      // disconnect bot
      if (clientSlack.user.username == botName) {

        slack.on("close", function() {
          console.warn("Disconnected from Slack.");
        });
      }

      tools.UpdateStatus(client, botName, { status: 'off', platform: 'Slack', brains: "null" });
    }
    else {
      console.log("Bot not running on Slack");
    }
    res.redirect('http://localhost:' + port);
  });
});
//******************************************/
//******** UPLOAD NEW BRAIN ***************/ 
//******************************************/

// Here we set the new brain in the database.
// The update of the bot with the new brains is carried out in the serverBot.js

app.use(methodOverride('_method', ['PUT']))

app.put('/upload', function (req, res) {
  var botName = req.body.BotName;
  console.log(botName)
  var platform = req.body.interface;
  console.log(platform)
  var newBrain = req.body.brain;

  var listBrains = []; //array of brains

  tools.findActiveBotName(client, botName, platform).then((val) => {
    
    var oldBrain = val[0].brains;
    
    listBrains.push(oldBrain);
    listBrains.push(newBrain);  // now the listBrains is ready

    tools.UpdateStatus(client, botName, { status: 'on', platform: platform, brains: listBrains }); // add new brain in the DBB

  });

  res.redirect('http://localhost:' + port);
});
