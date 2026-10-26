// Settings \\
let config = {
	InterfacePort: 42572, // The port number for the interface website [HTTP TCP] ex1: Port = 80 so website is 123.456.1337 ex2: Port = 81 so website is 123.456.1337:81
	InterfaceIoPath: "/ssb5", // For advanced users (proxies). If this is changed then change the paths mentioned in the index.html file as well.
}

// Document \\
/*

Add this to the top of your scripts first
const soundbrick = require("./sound-brick/index.js")

And now you can use the soundbrick() function!

soundbrick({
    url: "www.example.com/wave.mp3", // [Required]
    position: Vector3, // [Optional] 3D sound position
    isGlobal: true, // [Required] If enabled then position, minDistance and maxDistance will be ignored
    minDistance: 50, // [Optional] Distance before sound completely becomes unhearable (default 50)
    maxDistance: 10, // [Optional] Distance for full volume before fading to rolloff minDistance (default 10)
    isloop: false, // [Optional] [NOTE: If enabled then isGlobal will be set to true] If enabled then current playing loop will start over if url isnt the same
    musiccredit: "Mmuscic name | Mr Author | Licensed under Creative Commons: By Attribution 4.0 License", // [Optional] [Recommended for music loops] Display music credit. Set to "" to remove credit
})

You can also emit sound to only a player instead of everyone

soundbrick({
    url: "http://www.example.com/wave.mp3", // [Required]
    isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
},player)

Examples




A music loop to a player

soundbrick({
    url: `http://www.example.com/wave.mp3`,
    isGlobal: true,
    isloop: true
},player)


A credited music loop to everyone

soundbrick({
    url: `http://www.example.com/wave.mp3`,
    isGlobal: true,
    isloop: true,
    musiccredit: "Mmuscic name | Mr Author | Licensed under Creative Commons: By Attribution 4.0 License",
})

Global sound to everyone

soundbrick({
    url: "https://www.example.com/wave.mp3",
    isGlobal: true,
})

Global sound to a player

soundbrick({
    url: "http://www.example.com/wave.mp3",
    isGlobal: true,
},player)

Sound affected by distance to everyone

soundbrick({
    url: "https://www.example.com/wave.mp3",
    position: Vector3,
    isGlobal: false,
    minDistance: 50,
    maxDistance: 10,
})


*/

let express = getModule("express")
let app = express()
let http = getModule("http").Server(app)
let io = getModule("socket.io")
require("./sound-brick/index.js")({ config, express, app, http, io })
