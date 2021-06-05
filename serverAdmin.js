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

// collect the names of the brain for the bots
var fs = require('fs');
var files = fs.readdirSync('./brain');

// initialize bot rivescript for launching on Discord later
const RiveScript = require('rivescript');
const { render } = require('ejs');
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

app.get('/removeBot', (req, res) => {
  res.redirect('http://localhost:3001');
});


// LAUNCH BOT
//use case: select the name of the bot from a list and send it to the chatroom
app.post('/', function (req, res) {
  // Send Name Chatbot
  var botName = req.body.BotName;
  var platform = req.body.interface;
  var brainFile = req.body.brain;


  //********************************
  //********** BROWSER *************
  //********************************
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
      res.redirect('http://localhost:3001');
    });
  }

  //********************************
  //********** DISCORD *************
  //********************************
  else if (platform == "Discord") {

    tools.findActiveBotName(client, botName, platform).then((val) => {
      if (val == -1) {
        tools.UpdateStatus(client, botName, { status: 'on', platform: platform, brains: brainFile });

        // initialize rivescript bot 
        bot = new RiveScript();
        bot.loadFile("brain/" + brainFile).then(launchOnDiscord(botName)).catch(error_handler);
      }
      else {
        console.log("Bot already running");
      }
      // update interface 
      res.redirect('http://localhost:3001');
    });

  }

})

// require the discord.js module
const Discord = require('discord.js');

// create a new Discord client
const clientDiscord = new Discord.Client();

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
    if (message.author.bot) return;

    // get name of the other username
    var UserName = message.author.username;
    var UserMsg = message.content;

    //generate reply by bot
    bot.sortReplies();

    bot.reply(UserName, UserMsg).then(function (reply) {
      console.log("The bot says: " + reply);
      message.channel.send(reply);
    });
  });


  // login to Discord with your app's token
  clientDiscord.login(config.BOT_TOKEN);
}


function error_handler(loadcount, err) {
  console.log("Error loading batch #" + loadcount + ": " + err + "\n");
}

// DISABLE BOT FROM DISCORD
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
    res.redirect('http://localhost:3001');
  });
})


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

    // Update the bot with the new brains on the platform (ONLY FOR BROWSER INTERFACE)

    

  })

  res.redirect('http://localhost:3001');
})

// listen Admin service
app.listen(port, () => {
  console.log(`AdminService listening at http://localhost:${port}`)
})