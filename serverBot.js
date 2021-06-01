console.log("Server inialization... ");

//CREATE THE EXPRESS APP
const express = require('express')
const appBot = express();

const RiveScript = require('rivescript') ;

let userName = '';

// Render home page chatbot
appBot.get('/chatbot', (req, res) => {
  userName = req.query.user;
  if (typeof userName == 'undefined'){
    res.redirect('http://localhost:3000');
    console.log('Cannot access without loging in first')
  }
  else {
    res.render('chat');
    console.log(userName);
  }
})

var bot = new RiveScript();
bot.loadDirectory("brain").then(success_handler).catch(error_handler);

function success_handler() {
	console.log("Brain loaded!");
	//bot.sortReplies();

	// Set up the Express app.
  portBot = 3002;

	// Parse application/json inputs.
	appBot.set('view engine', 'ejs');
  appBot.set('views', './views');
  appBot.use(express.static("public"));

  // listen Chatbot service
  const server = appBot.listen(portBot, () => {
  console.log(`BotService listening at http://localhost:${portBot}/chatbot`)
  });

  
  const io = require('socket.io')(server);

  // Chatroom

  let numUsers = 0;

  io.on('connection', (socket) => {
    let addedUser = false;
    let addedBot = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });

    //when adminn creates the new bot
    socket.on('add bot', (botName) => {
      if (addedBot) return; //if already addede

      // we store the username in the socket session for this client
      socket.botName = botName;
      addedBot = true;
      console.log(botName);
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
      if (addedUser) return;

      // we store the username in the socket session for this client
      socket.username = username;
      ++numUsers;
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
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
      if (addedUser) {
        --numUsers;

        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });
  });

	// Set up routes.
	//appBot.post("/reply", getReply);



}

function error_handler (loadcount, err) {
	console.log("Error loading batch #" + loadcount + ": " + err + "\n");
}

