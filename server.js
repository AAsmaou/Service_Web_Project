console.log("Server inialization... ");

//CREATE THE EXPRESS APP
const express = require('express')
const app = express()
const port = 3000

//set the view engine as ejs
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// DATABASE UTILITIES
var tools = require('./model/DatabaseUtility');

// establish database connection
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://gas:WebProject@cluster0.gsyew.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useUnifiedTopology: true});
tools.DatabaseConnectionOpen(client).catch(console.error);

var User = [];


// WELCOME PAGE
app.get('/', (req, res) => {
  res.render('login');
})


app.post('/', function (req, res) {
  //retrieve value from the form
  let nickname = req.body.username;
  let psw = req.body.password;

  User.push({ username: nickname, password: psw });

  // find users in the database
  const result = tools.findOneListingByName(client, nickname, psw);

  // redirect users to web service
  if (result) {
    res.render('temp', {data: User});
  }
})

//LISTEN PORT
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
