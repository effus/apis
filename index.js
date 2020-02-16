const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const Api100 = require('./app/api.1.0.0');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/meetapi', (req, res) => {
    res.send({ version: '1.0.0' });
  })
  .post('/meetapi/1.0.0/register', (new Api100()).register)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
