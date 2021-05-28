console.log("Server inialization... ");

//CREATE THE EXPRESS APP
const express = require('express')
const app = express()
const port = 3002

//set the view engine as ejs
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

var User = [];


var RiveScript = require("rivescript");
var bot = new RiveScript();

bot.loadDirectory("brain");

app.use(express.static('assets'));

app.get('/', function (req, res) {
});


app.post('/', function (req, res) {
  
})

//LISTEN PORT
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
