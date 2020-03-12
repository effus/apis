const express = require('express');
const PORT = process.env.PORT || 5000;
const path = require('path')

const Api100 = require('./api.1.0.0');
let app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => {
    res.send({result: true});
});
app.get('/apiinfo', (req, res) => {
  Db.connect().then(() => {
    res.send({ apis: ['1.0.0'], db: {connected: true}});
  });
})
app.use('/meetapi/1.0.0', Api100);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
