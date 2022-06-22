const express = require('express');
const PORT = 3000;
const app = express();
const path = require('path');

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.use('/', express.static(__dirname + "/public"));

app.listen(PORT,()=>{
    console.log("Applicazione in ascolto sulla porta "+PORT);
});