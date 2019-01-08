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
        chat.volatile.emit("userlist",{clients:JSON.stringify(userlist)});
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
        //socket.broadcast.emit('typing', {username : socket.username})
        socket.broadcast.to(clients[data.to].socket).emit('typing', {username : socket.username})
    })

    //Removing the socket on disconnect
    socket.on('disconnect_user', (data) => {
        // var index=userlist.indexOf(data.username);
        // userlist.splice(index,1);
        // for(var name in clients) {
        //     if(clients[name].socket === socket.id) {
        //         delete clients[name];
        //         break;
        //     }
        // }
        // console.log("Clients: " + JSON.stringify(clients));
        chat.volatile.emit("userlist",{clients:JSON.stringify(userlist)});	
    })

    socket.on('reconnect', (attemptNumber) => {
        console.log("reconnect called");
      });

    // on reconnection, reset the transports option, as the Websocket
    // connection may have failed (caused by proxy, firewall, browser, ...)
    socket.on('reconnect_attempt', () => {
        socket.io.opts.transports = ['polling', 'websocket'];
    });
})

var news = io
  .of('/news')
  .on('connection', function (socket) {
    console.log('New news channel connected')
  });
