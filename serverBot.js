console.log("Server inialization... ");

//CREATE THE EXPRESS APP
const express = require('express')
const appBot = express();

portBot = 3002;

	// Parse application/json inputs.
	appBot.set('view engine', 'ejs');
  appBot.set('views', './views');
  appBot.use(express.static("public"));

  // listen Chatbot service
  const server = appBot.listen(portBot, () => {
  console.log(`BotService listening at http://localhost:${portBot}/chatbot`)
  });

// DATABASE UTILITIES
var tools = require('./model/DatabaseUtility');

// establish database connection
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://gas:WebProject@cluster0.gsyew.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useUnifiedTopology: true});
tools.DatabaseConnectionOpen(client).catch(console.error);

const RiveScript = require('rivescript') ;
var bot = new RiveScript();


let userName = '';

// Render home page chatbot
appBot.get('/chatbot', (req, res) => {
  userName = req.query.user;
  if (typeof userName == 'undefined'){
    res.redirect('http://localhost:3000'); //redirect to the login page
    console.log('Cannot access without loging in first')
  }
  else {
    res.render('chat');
    console.log(userName);
    bot.loadDirectory("brain").then(success_handler).catch(error_handler);
  }
})


function success_handler() {
	console.log("Brain loaded!");

  // Now the replies must be sorted!
	bot.sortReplies();


  const io = require('socket.io')(server);

  // Chatroom

  io.on('connection', (socket) => {

    var robot;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {

      //read user message
      UserName = socket.username;
      UserMsg = data;

      //generate reply by bot
      bot.reply(UserName, UserMsg).then(function(reply) {
        console.log("The bot says: " + reply);
        socket.emit('bot message', {botName: robot, botmessage: reply});
      });

      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });

    
    // set the name of the bot for the chat
    // ASSUMPTION: we pick the last bots launched on the web platform
    tools.findActiveBot(client, 'Web').then((val) => {
      
      if (val != -1){
        
        val.forEach((result) => {

          robot = result.name;
    
        });
        console.log(robot);
        socket.emit('bot message', {botName: robot, botmessage: "Hello :) How are you going?"});
      }
      else{
        console.log('No active bots on Web platform!');
        socket.emit('bot message', {botName: 'ERROR', botmessage: "No bots running on the Server at the moment!"});
      }}
    );


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
}

function error_handler (loadcount, err) {
	console.log("Error loading batch #" + loadcount + ": " + err + "\n");
}
