console.log("Server inialization... ");

//**************************************************/
//************ INITIALIZE APP **********************/ 
//**************************************************/
const express = require('express')
var cors = require('cors')
const appBot = express();

portBot = 3002;

// Parse application/json inputs.
appBot.set('view engine', 'ejs');
appBot.set('views', './views');
appBot.use(express.static("public"));

appBot.use(cors())

// listen Chatbot service
const server = appBot.listen(portBot, () => {
  console.log(`BotService listening at http://localhost:${portBot}/chatbot`)
});


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
//********** RIVESCRIPT INITIALIZATION *************/ 
//**************************************************/

const RiveScript = require('rivescript');
var bot = new RiveScript();

var robot;
var userName;



//**************************************************/
//************ GET: DISPLAY CHATROOM ***************/ 
//**************************************************/

appBot.get('/chatbot', (req, res) => {

  userName = req.query.user;
  
  if (typeof userName == 'undefined') {

    res.redirect('http://localhost:3000'); //redirect to the login page

    console.log('Cannot access without loging in first')
  }
  else {
    res.render('chat');

    var brain;

    // set the name of the bot for the chat and the brain used
    // ASSUMPTION: we pick the last bots launched on the web platform if more exists
    tools.findActiveBot(client, 'Browser').then((val) => {

      if (val != -1) {

        val.forEach((result) => {   // val actually contains only an instance, since only one bot can run on Browser at a time

          robot = result.name;
          brain = result.brains;
          
          bot.loadFile("brain/" + brain).then(success_handler).catch(error_handler);

        });

        // set the name of the bot on Rivescript
        bot.setVariable("name", robot);

      }
      else {
        robot = "noRobot";
      }
    }
    );
  }
})


//**************************************************/
//***************** RUN BOT  ***********************/ 
//**************************************************/

function success_handler() {
  console.log("Brain loaded!");

  // Now the replies must be sorted!
  bot.sortReplies();

  // store in the database the name of the robot with whom the user is speaking
  // TO DO: retrieve name of the user that logged in 
  tools.updateUser(client, "user2", {bot : robot});

  const io = require('socket.io')(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"]
    }
  });

  // Chatroom

  io.on('connection', (socket) => {

    // welcome message from robot
    if (robot == "noRobot") {
      console.log('No active bots on Browser platform!');
      socket.emit('bot message', { botName: 'ERROR', botmessage: "No bots running on the Server at the moment!" });
    }
    else {
      socket.emit('bot message', { botName: robot, botmessage: "Hello :) here it is " + robot });
    }
    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {

      //read user message
      UserName = socket.username;
      UserMsg = data;

      //generate reply by bot
      bot.reply(UserName, UserMsg).then(function (reply) {

        //console.log("The bot says: " + reply);
        socket.emit('bot message', { botName: robot, botmessage: reply });

        socket.broadcast.emit('bot message', {
          botName: robot,
          botmessage: reply
        });
      });

      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });


    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
      // we store the username in the socket session for this client
      socket.username = username;
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username
      });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username
      });
    });
  });

  // CHECKS IF TO UPDATE THE BRAIN
  updateBrain(robot, "Browser");
}


//******************************************/
//************ UPDATE BRAINS ***************/
//******************************************/

// it updates the brains if some changes in the bots collection happened.

async function updateBrain(botname, platform) {

  // set up filter for looking for changes
  const pipeline = [
    { $match: { 'operationType': 'update', 'fullDocument.name': botname, 'fullDocument.status': 'on', 'fullDocument.platform': platform } }
  ];

  // set options: updateLookup means to return all the fields of the updated document
  var options = { fullDocument: 'updateLookup' };

  // check for changes in the databases
  const changeStream = client.db("test").collection("bots").watch(pipeline, options);

  changeStream.on('change', data => {

    // load all the brain files
    const brainList = data.fullDocument.brains;

    for (let index = 0; index < brainList.length; index++) {
      bot.loadFile("brain/" + brainList[index]).then(BrainUploadSuccess(brainList[index])).catch(error_handler);
    }

    bot.sortReplies();

  });
}


//*****************************************************************/
//************ UTILITIES FOR LOADING OF THE BRAINS ***************/
//****************************************************************/

function BrainUploadSuccess(file) {
  console.log("Brain " + file + " successfully uploaded and running!");
}


function error_handler(loadcount, err) {
  console.log("Error loading batch #" + loadcount + ": " + err + "\n");
}