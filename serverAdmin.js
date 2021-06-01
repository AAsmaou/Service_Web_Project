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

  
app.use(cors());
var corsOptions = {
  origin: 'http://localhost:3001',
  methods: 'GET,POST,PUT,DELETE',
  optionsSuccessStatus: 200 
};
let Bot = require('./Bot.js');
let Bots = require('./Bots.js');
const bots = new Bots();

//const open = require('open')

const io = require('socket.io')(server);


// Render home page admin
app.get('/', (req, res) => {
  res.render('admin');
});

//update a chatbot
app.put('/bots/:name', cors(corsOptions), function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if(req.is('json')){
    var botUpdate = bots.updateBot(req.body);
    if(undefined==botUpdate){
      res.send(404, 'Page introuvable !');
    }
    else{
      res.json(botUpdate);
      console.log("Done updating "+JSON.stringify(botUpdate) );
    }  
  }
  else{
    res.send(400, 'Bad Request !');
  }
});
// delete the chatbot
app.delete('/bots/:name', cors(corsOptions),function(req, res) {
  let name = bots.deleteBot(parseInt(req.params.name));
console.log("delete "+name+" "+req.params.name+" hop");
  if(undefined!=name){
      res.setHeader('Content-Type', 'text/plain');
      res.send(200,'Done');
  }else{
    res.send(404, 'Can not find the page !');
}
});

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