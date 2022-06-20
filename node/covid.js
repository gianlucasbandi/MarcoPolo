const express = require('express')
var request2server = require('request');
const app = express();
const port = 3000;
app.use(express.json());

app.get('/ita', (req, res) => {
    res.send('https://corona.lmao.ninja/v2/countries/:query?strict=true')
})

app.get('/', (req, res) => {
    res.send('Aoh je sta')
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})