const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const mongoose = require('./mongo');

const Api100 = require('./app/api.1.0.0');

let app = express();

app.use((req, res, next) => {
  console.log('mongoose debg', mongoose);
  if (mongoose.connection && mongoose.connection.readyState) {
    next();
  } else {
    require('./mongo').then(() => next());
  }
});

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/meetapi', (req, res) => {
    res.send({ version: '1.0.0' });
  })
app.get('/meetapi/1.0.0/register', (new Api100()).register)
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
