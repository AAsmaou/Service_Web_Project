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



// RENDER HOME PAGE FOR ADMIN
app.get('/', (req, res) => {
  
  var BotOnDiscord = [];
  var bots = [];
  

  // FIND ACTIVE BOTS ON DISCORD
  tools.findActiveBot(client, 'Discord').then((val) => {
    if (val==-1){
      BotOnDiscord = -1;
    }
    else{
      BotOnDiscord = val;
    }
    // FIND ALL BOTS
    tools.findBots(client).then((val) => {
      if (val==-1){
        bots = -1;
      }
      else{
        bots = val;
      }
    res.render('admin', { results: bots, filelist: files, DiscordBot: BotOnDiscord});
  });
});
});


// LAUNCH BOT
//use case: select the name of the bot from a list and send it to the chatroom
app.post('/', function (req, res) {
  // Send Name Chatbot
  var botName = 'Steeve'; //just for developing
  var BotOnDiscord = [];
  var bots = [];
  
  // check if botName is already running
  tools.findActiveBotName(client, botName).then((val) => {
    if (val==-1){
      tools.MarkBotAsRunning(client, "Steeve", {status: 'on', platform: 'Web'});
      console.log("Bot launched");
    }
    else{
      console.log("Bot already running");
    }
      // update interface 
      // update bots running on Discord
      tools.findActiveBot(client, 'Discord').then((val) => {
        if (val==-1){
          BotOnDiscord = -1;
        }
        else{
          BotOnDiscord = val;
        }
        // find all bots
        tools.findBots(client).then((val) => {
          if (val==-1){
            bots = -1;
          }
          else{
            bots = val;
          }
      res.render('admin', { results: bots, filelist: files, DiscordBot: BotOnDiscord});
      });
    });
  });

})

// listen Admin service
app.listen(port, () => {
  console.log(`AdminService listening at http://localhost:${port}`)
})