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


// Render home page admin
app.get('/', (req, res) => {
  var fs = require('fs');
  var files = fs.readdirSync('./brain');
  console.log(files);
  var BotOnDiscord;
  var bots;

  // find all the active bots on Discord for the Discord control pannel
  tools.findActiveBot(client, 'Discord').then((val) => {
    if (val==-1){
      BotOnDiscord = -1;
    }
    else{
      BotOnDiscord = val;
    }
  });

  
  tools.findBots(client).then((val) => {
    if (val==-1){
      bots = -1;
    }
    else{
      bots = val;
    }
    res.render('admin', { results: bots, filelist: files, DiscordBot: BotOnDiscord });
  });

});

// create the bot
//use case: select the name of the bot from a list and send it to the chatroom
app.post('/', function (req, res) {
  // Send Name Chatbot
  let botName = 'Steeve'; //just for developing
  tools.MarkBotAsRunning(client, { name: botName, platform: "Web" });
  //res.render('admin');
})

// listen Admin service
app.listen(port, () => {
  console.log(`AdminService listening at http://localhost:${port}`)
})