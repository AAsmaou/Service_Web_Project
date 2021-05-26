console.log("Server inialization... ");

//CREATE THE EXPRESS APP FOR CHATBOX MANAGEMENT (ADMIN PAGE)
const express = require('express')
const app = express()
const appBot = express();
const port = 3001
var portBot = 0

//set the view engine as ejs
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const RiveScript = require('rivescript');

//const open = require('open')

var User = [];


// Render home page admin
app.get('/', (req, res) => {
  res.render('admin');
})


// Render home page chatbot
appBot.get('/chatbot', (req, res) => {
  res.render('chat');
})


// create the bot
app.post('/', function (req, res) {

  // start chatbot in a new window
  //open( 'http://localhost:'+ portBot + '/chatbot', function (err) {
  //if ( err ) throw err;    
  //res.redirect('http://localhost:'+ portBot + '/chatbot');

  // ChatBot initialization
  var bot = new RiveScript();
  bot.loadDirectory("brain").then(success_handler).catch(error_handler);
})

function success_handler() {
	console.log("Brain loaded!");
	//bot.sortReplies();

	// Set up the Express app.
  portBot = 3002;

	// Parse application/json inputs.
	appBot.set('view engine', 'ejs');
  appBot.set('views', './views');
  appBot.use(express.static("public"));
  appBot.use(express.json()) // for parsing application/json
  appBot.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

	// Set up routes.
	//appBot.post("/reply", getReply);
	//appBot.get("/", showUsage);
	//appBot.get("*", showUsage);
  // Send messages to chatbot
  appBot.post('/chatbot', (req, res) => {
    let mes = req.body.message;
    console.log('User wrote:' + mes);


  });

  // listen Chatbot service
  appBot.listen(portBot, () => {
    console.log(`BotService listening at http://localhost:${portBot}/chatbot`)
  });
}

function error_handler (loadcount, err) {
	console.log("Error loading batch #" + loadcount + ": " + err + "\n");
}

// Send a JSON error to the browser.
function error(res, message) {
	res.json({
		"status": "error",
		"message": message
	});
}


// listen Admin service
app.listen(port, () => {
  console.log(`AdminService listening at http://localhost:${port}`)
})


