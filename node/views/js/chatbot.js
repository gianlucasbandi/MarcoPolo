$(document).ready(function (){
    var $chatbotUL = $("#chatbotUL");
    var $sendBtn =  $("#inputSubmit");
    var $inputMsg = $("#inputMsg");


    const ws = new WebSocket('wss://localhost:8083/chatbot');


    //Node send message via ws
    ws.addEventListener("message",function(event){
        var $newItem = $("<li style=text-align:left;margin-left:0><p>"+event.data+"</p></li>");
        $chatbotUL.append($newItem);
    });


    //Client send message via ws
    $sendBtn.on("click",function(e){
        e.preventDefault();
        
        var msg = $inputMsg.val();
        if(msg != ""){
            ws.send(msg);
        }

        $inputMsg.val("");
    });

});