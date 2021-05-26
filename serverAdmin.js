console.log("Server inialization... ");

//CREATE THE EXPRESS APP
const express = require('express')
const app = express()
const port = 3001

//set the view engine as ejs
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

var User = [];


// WELCOME PAGE
app.get('/', (req, res) => {
  res.render('admin');
})


app.post('/', function (req, res) {

  // start chatbot
  if (result) {
    res.render('temp', {data: User});
  }
})

//LISTEN PORT
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
