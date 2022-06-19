const express = require('express');
const PORT = 3000;
const app = express();

app.get("/",(req,res)=>{
    const nodo = process.env.ISTANCE;
    res.end("Ciao, sono il nodo "+nodo.toString());
});

app.listen(PORT,()=>{
    console.log("Applicazione in ascolto sulla porta "+PORT);
});