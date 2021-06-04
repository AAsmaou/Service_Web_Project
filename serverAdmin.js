console.log("Server inialization... ");

// DATABASE UTILITIES
var tools = require('./model/DatabaseUtility');

// establish database connection
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://gas:WebProject@cluster0.gsyew.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true });
tools.DatabaseConnectionOpen(client).catch(console.error);

//CREATE THE EXPRESS APP FOR CHATBOX MANAGEMENT (ADMIN PAGE)
const express = require('express')
const app = express()
const port = 3001


//set the view engine as ejs
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// collect names of the brain for the bots
var fs = require('fs');
var files = fs.readdirSync('./brain');
console.log(files);

// initialize bot rivescript for launching on Discord later
const RiveScript = require('rivescript');
var bot = new RiveScript();


// RENDER HOME PAGE FOR ADMIN
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


// LAUNCH BOT
//use case: select the name of the bot from a list and send it to the chatroom
app.post('/', function (req, res) {
  // Send Name Chatbot
  var botName = req.body.BotName; //just for developing
  console.log("bot to launch: " + botName);
  var platform = req.body.interface;
  console.log("interface: " + platform);
  var brainFile = req.body.brain;
  console.log(brainFile);
  var BotOnDiscord = [];
  var bots = [];

  //********************************
  //********** BROWSER *************
  //********************************
  // check if botName is already running
  if (platform == "Browser") {
    tools.findActiveBotName(client, botName, platform).then((val) => {
      if (val == -1) {
        tools.MarkBotAsRunning(client, botName, { status: 'on', platform: platform, brains: brainFile });
        console.log("Bot launched");
      }
      else {
        console.log("Bot already running");
      }
      // update interface 
      // update bots running on Discord
      tools.findActiveBot(client, 'Discord').then((val) => {
        if (val == -1) {
          BotOnDiscord = -1;
        }
        else {
          BotOnDiscord = val;
        }
        // find all bots
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
  }

  //********************************
  //********** DISCORD *************
  //********************************
  else if (platform == "Discord") {

    tools.findActiveBotName(client, botName, platform).then((val) => {
      if (val == -1) {
        tools.MarkBotAsRunning(client, botName, { status: 'on', platform: platform, brains: brainFile });

        // initialize rivescript bot 
        bot = new RiveScript();
        bot.loadFile("brain/" + brainFile).then(launchOnDiscord(botName)).catch(error_handler);
      }
      else {
        console.log("Bot already running");
      }
      // update interface 
      // update bots running on Discord
      tools.findActiveBot(client, 'Discord').then((val) => {
        if (val == -1) {
          BotOnDiscord = -1;
        }
        else {
          BotOnDiscord = val;
        }
        // find all bots
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

  }

})

async function launchOnDiscord(name) {

  // require the discord.js module
  const Discord = require('discord.js');
  const config = require("./config.json");

  // create a new Discord client
  const clientDiscord = new Discord.Client();

  // set bot name
  //client.user.setUsername(name);  // try to see it works

  // when the client is ready, run this code
  // this event will only trigger one time after logging in
  clientDiscord.once('ready', () => {
    console.log("Bot ready on Discord");
  });

  // read messages sent by the user and reply to them
  clientDiscord.on('message', message => {
    if (message.author.bot) return;

    // get name of the other username
    var UserName = message.author.username;
    var UserMsg = message.content;

    //generate reply by bot
	  bot.sortReplies();

    bot.reply(UserName, UserMsg).then(function(reply) {
      console.log("The bot says: " + reply);
      message.channel.send(reply);
    });
  });


  // login to Discord with your app's token
  clientDiscord.login(config.BOT_TOKEN);
}


function error_handler (loadcount, err) {
	console.log("Error loading batch #" + loadcount + ": " + err + "\n");
}



// listen Admin service
app.listen(port, () => {
  console.log(`AdminService listening at http://localhost:${port}`)
})