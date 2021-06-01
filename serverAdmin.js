console.log("Server inialization... ");

//use case: select the name of the bot and send it to the chatroom


//CREATE THE EXPRESS APP FOR CHATBOX MANAGEMENT (ADMIN PAGE)
const express = require('express')
const app = express()
const appBot = express()
const port = 3001


//set the view engine as ejs
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// listen Chatbot service
portBot = 3002;
const server = appBot.listen(portBot, () => {
  console.log(`Listening at chatroom: http://localhost:${portBot}/chatbot`)
  });

const io = require('socket.io')(server);


// Render home page admin
app.get('/', (req, res) => {
  res.render('admin');
})


// create the bot
//use case: select the name of the bot and send it to the chatroom
app.post('/', function (req, res) {

  // start chatbot in a new window
  //open( 'http://localhost:'+ portBot + '/chatbot', function (err) {
  //if ( err ) throw err;    
  //res.redirect('http://localhost:'+ portBot + '/chatbot');

  // Send Name Chatbot
  let botName = 'Steeve';
  io.on('connection', (socket) => {
    socket.emit('add bot', {
      botName: botName
    });
  });
})

// listen Admin service
app.listen(port, () => {
  console.log(`AdminService listening at http://localhost:${port}`)
})