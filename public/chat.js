
$(function(){
   	//make connection
	//var socket = io.connect('http://localhost:3000')
	var socket = io.connect('http://localhost:3000/chat')
    , news = io.connect('http://localhost:3000/news');

	//buttons and inputs
	var message = $("#message")
	var to = $("#to")
	var username = $("#username")
	var send_message = $("#send_message")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var users = $("#users-list")
	var feedback = $("#feedback")

	//Emit message
	send_message.click(function(){
		console.log(socket.id);
		socket.emit('new_message', {message : message.val(),to : to.val(),from : username.val()})
	})

	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		if(data.isSender) {
			chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
		}
		else {
			chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
		}
	})

	//Emit a username
	send_username.click(function(){
		socket.emit('change_username', {username : username.val()})
	})

	socket.on("userlist",(data)=> {
		var clients=JSON.parse(data.clients);
		users.html('');
		clients.forEach(element => {
			users.append("<div class='column users' style='width:100%'>" + element+"</div>")	
		});
	})
	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
		//news.emit('typing');
	})

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})

	//Listen on typing
	news.on('typing', (data) => {
		//feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})
});


