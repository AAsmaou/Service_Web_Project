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

  //***********************************************
  //**************** BROWSER **********************
  //***********************************************
  // Launch bot on the browser. 
  //We set up the bot as launched on the database. The bot is launched in the serverBot.js after checking it has been initialized as launched on the database


  // check if botName is already running
  if (platform == "Browser") {
    tools.findActiveBotName(client, botName, platform).then((val) => {

      tools.findActiveBot(client, platform).then((botsOnThePlatform) => { // list of all bots running on that platform ( it is always made of only one element)

        if (val == -1) {

          // disable the last bot that was running
          if (botsOnThePlatform.length > 0) {

            const LastRunningBot = botsOnThePlatform[0].name;

            tools.UpdateStatus(client, LastRunningBot, { status: 'off', platform: 'None', brains: 'null' });
          }

          // set new bot as launched
          tools.UpdateStatus(client, botName, { status: 'on', platform: platform, brains: brainFile });

          console.log(botName + " launched on " + platform);

        }
        else {
          console.log(botName + " already running");
        }
        // update interface 
        res.redirect('http://localhost:' + port);
      });
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
        tools.updateUser(client, "user2", { bot: botName });

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


  /*********************************************************
  //********** LAUNCH BOT ON SLACK  ************************
  //*********************************************************

  else if (platform == "Slack") {

    //const config = require("./config.json");

    // Read a token from the environment variables
    //const token = config.BOT_SLACK_TOLEN;

    // Initialize

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
  } */

})


//******************************************************************************
//********** Function for launching the bot on DIscord  ************************
//******************************************************************************

// URL for connecting bot to your server: https://discord.com/api/oauth2/authorize?client_id=850311681304821770&permissions=8&scope=bot
async function launchOnDiscord(name) {

  const config = require("./config.json");

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


  // login to Discord with your app's token
  clientDiscord.login(config.BOT_TOKEN);
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
//******** UPLOAD NEW BRAIN ***************/ 
//******************************************/

// Here we set the new brain in the database.
// The update of the bot with the new brains is carried out in the serverBot.js

app.use(methodOverride('_method', ['PUT']))

app.put('/upload', function (req, res) {
  var botName = req.body.BotName;
  var platform = req.body.interface;
  var newBrain = req.body.brain;

  var listBrains = []; //array of brains

  tools.findActiveBotName(client, botName, platform).then((val) => {

    var oldBrain = val[0].brains;

    listBrains.push(oldBrain);
    listBrains.push(newBrain);  // now the listBrains is ready

    tools.UpdateStatus(client, botName, { status: 'on', platform: platform, brains: listBrains }); // add new brain in the DBB

  })

  res.redirect('http://localhost:' + port);
})


/******************************************************************************************************
//********** Function for launching the bot on Slack  ( NOT USED BUT WORKING ) ************************
//*****************************************************************************************************

//URL for connecting to our teams https://join.slack.com/t/newworkspace-4hd9708/shared_invite/zt-rad6a6vp-~CHpY8RVqVMv4K~vDqI_3w

// The following function is able to send a message on a channel where the bot is joining.
// TO DO: implement a websocket for receiving the messages from the user and read them. 

async function launchOnSlack(name) {

  const { WebClient } = require('@slack/web-api');

  const config = require("./config.json");

  // An access token (from your Slack app or custom integration - xoxp, xoxb)
  const token = config.SLACK_TOKEN;

  const web = new WebClient(token);

  // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
  // C024XELDGD6 = " # bot" channel
  const conversationId = 'C024XELDGD6';

  
  (async () => {
    // See: https://api.slack.com/methods/chat.postMessage
    const res = await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });
    

    // `res` contains information about the posted message
    //console.log('Message sent: ', res.ts);

  })();
} */