const express = require('express');
const PORT = process.env.PORT || 5000;
const path = require('path');
const cors = require('cors');

const Api100 = require('./app/api.1.0.0');
const Api210 = require('./app/api.2.1.0');
let app = express();
app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => {
    res.send({result: true, dt: new Date().toString()});
});
app.get('/apiinfo', (req, res) => {
  Db.connect().then(() => {
    res.send({ apis: ['1.0.0', '2.0.0'], db: {connected: true}});
  });
})
app.use('/datesimapi/1.0.0', Api100);
app.use('/2.1.0', Api210);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
