
$(function(){
   	//make connection
	//var socket = io.connect('http://localhost:3000')
	var socket = io.connect('http://localhost:3000/chat')
    , news = io.connect('http://localhost:3000/news');

	//buttons and inputs
	var message = $("#message")
	var to = "";
	var username = $("#username")
	var change_username = $("#change_username")
	var disconnect_user = $("#disconnect_user")
	var send_message = $("#send_message")
	var connectUser = $("#send_username")
	var disconnectUser = $("#disconnectUser")
	var chatroom = $("#chatroom")
	var users = $("#users-list")
	var feedback = $("#feedback")
	var userlist=$("#users-list")
	var userCnt=$("#user-cnt");

	

	//Emit message
	send_message.click(function(){
		console.log(socket.id);
		chatroom.append("<p class='message'>" + username.val() + ": " + message.val() + "</p>")
		socket.emit('new_message', {message : message.val(),to :to,from : username.val()})
	})

	//Listen on new_message
	socket.on("new_message", (data) => {

		//var feedback=$('#feedback-'+to+'-'+data.username);
		feedback.html('');
		message.val('');
		if(data.isSender) {
			chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
		}
		else {
			chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
		}
	})

	//Connect
	connectUser.click(function(){
		socket.emit('change_username', {username : username.val()})
		change_username.hide();
		disconnect_user.show();
	})

	disconnectUser.click(function(){
		socket.emit('disconnect_user',{});
	})



	socket.on("userlist",(data)=> {
		var clients=JSON.parse(data.clients);
		users.html('');
		userCnt.html('');
		var count=clients.length;
		userCnt.append(count);
		totClients =Object.keys(clients).length;
		if(totClients!=0){
			if(totClients!=1){
				clients.forEach(element => {
					users.append("<a href='#' id='item-"+ count +"' class='column users' style='width:100%;border: 1px solid #000;display: inline-table;text-decoration:none'>" + element+"</a>")	
				});
			}
			else 
			{
				users.append("<a href='#' id='item-"+ count +"' class='column users' style='width:100%;border: 1px solid #000;display: inline-table;text-decoration:none'>" + clients+"</a>")	
			}
		}
	})
	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing',{to:to})
	})

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})

	//Listen on typing
	news.on('typing', (data) => {
		//feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})

	userlist.on('click', 'a', function(event) {
		event.preventDefault();
		to=$(this).text();
	  });
});


