const { Server } = require("socket.io")
const express = require("express")
const cors = require("cors")
const http = require("http")

let URLS = ["http://localhost:3000"] // Client urls
let PORT = 3001 // Server port
// let IPAddess = "Localhost" // Server IP Address

const app = express();
app.use(cors())

const SERVER = http.createServer(app)

const io = new Server(SERVER, {
    "cors": {
        origin: URLS,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
})
// Current Users
let CurrentUser = []

io.on("connection", (socket) => {

    //console.log(`User connected : ${socket.id}`)
    //console.log("Logged User "+ socket.handshake.query.loggeduser)
    if (socket.handshake.query.loggeduser) {
        // Add the new User
        CurrentUser.push({ UserID: socket.id, CurrentUser: socket.handshake.query.loggeduser })
        // Send to welcome popup so others may know.
        socket.broadcast.emit("welcome", { msg: `${socket.handshake.query.loggeduser} has logged IN` })

        console.log("Logged In: ",CurrentUser)
    }

    // Send Messages in the Chatroom
    socket.on("msg", (data) => {
        socket.broadcast.emit("broadcastmsg", data)
    })

    // Let Logout message
    socket.on("disconnect", () => {
        //console.log(socket.id); 
        CurrentUser = CurrentUser.filter(item => item.UserID !== socket.id)
        console.log("Current User : ",CurrentUser);
        socket.broadcast.emit("loggout", { msg: `${socket.handshake.query.loggeduser} has logged OUT` })
    });
})

console.log("Server has started ...")

app.get("/", (req, res) => {
    res.statusCode = 200
    res.setHeader("Content-Type","application/json")
    res.send("Server is running.")
})

SERVER.listen(PORT, () => {
    console.log(`SERVER is Listening at ${PORT}`)
})
