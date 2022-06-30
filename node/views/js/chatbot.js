$(document).ready(function (){
    var $chatbotUL = $("#chatbotUL");
    var $sendBtn =  $("#inputSubmit");
    var $inputMsg = $("#inputMsg");
    var $chat = $(".chat");

    const ws = new WebSocket('wss://localhost:8083/chatbot');


    //Node send message via ws
    ws.addEventListener("message",function(event){
        var $newItem = $("<li class='bot-msg'><p>"+event.data+"</p></li>");
        $chatbotUL.append($newItem);
        chatScrollDown();
    });


    //Client send message via ws
    $sendBtn.on("click",function(e){
        e.preventDefault();
        
        var msg = $inputMsg.val();
        if(msg != ""){
            ws.send(msg);
            var $newItem = $("<li class='usr-msg'><p>"+msg+"</p></li>");
            $chatbotUL.append($newItem);
            chatScrollDown();
        }

        $inputMsg.val("");
    });


    function chatScrollDown(){
        $chat.animate({
            scrollTop: $chat[0].scrollHeight
        }, 1000);
    }
});