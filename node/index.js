const express = require('express');
const path = require('path');

const PORT = 3000;
const app = express();


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(__dirname + '/views'));      //Usato per caricare i file statici (css)

app.get("/",(req,res)=>{
    res.render("index",{logged:false});
});

app.get("/login",(req,res)=>{
    res.end("Cisanini");
});



app.listen(PORT,()=>{
    console.log("Applicazione in ascolto sulla porta "+PORT);
});