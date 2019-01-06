const express = require('express')
const app = express()


//set the template engine ejs
app.set('view engine', 'ejs')

//middlewares
app.use(express.static('public'))


//routes
app.get('/', (req, res) => {
	res.render('index')
})

app.get('/adduser', (req, res) => {
	res.render('adduser')
})
//Listen on port 3000
server = app.listen(3000)



//socket.io instantiation
const io = require("socket.io")(server)

var clients = {};
var userlist=[];
//listen on every connection
chat = io.of('/chat').on('connection', (socket) => {
	console.log('New user connected')
    
	//default username
	socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
        userlist.splice(0,data.username);
        userlist.push(data.username);
        clients[data.username] = {
            "socket": socket.id
        };
        console.log("Clients: " + JSON.stringify(clients));
        chat.emit("userlist",{clients:JSON.stringify(userlist)});
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        console.log("Sending: " + data.message + " to " + data.to + " from " + data.from);
        if (clients[data.to]){
            chat.connected[clients[data.to].socket].emit("new_message", {message : data.message, username : data.from, isSender : false});
            chat.connected[clients[data.from].socket].emit("new_message", {message : data.message, username : data.from, isSender : true});
        } else {
            console.log("User does not exist: " + data.to); 
        }
    })

    //listen on typing
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })

    //Removing the socket on disconnect
    socket.on('disconnect', function() {
        for(var name in clients) {
            if(clients[name].socket === socket.id) {
                delete clients[name];
                break;
            }
        }	
    })
})

var news = io
  .of('/news')
  .on('connection', function (socket) {
    console.log('New news channel connected')
    // socket.on('typing', (data) => {
    //     console.log('New news came')
    // 	socket.broadcast.emit('typing', {username : 'testuser'})
    // })
  });
