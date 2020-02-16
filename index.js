const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const Db = require('./mongo.js');


const Api100 = require('./app/api.1.0.0');

let app = express();


app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/apiinfo', (req, res) => {
  Db.connect().then(() => {
    res.send({ apis: ['1.0.0'], db: {connected: true}});
  });
})
app.get('/meetapi/1.0.0/register', (new Api100(Db)).register)
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
