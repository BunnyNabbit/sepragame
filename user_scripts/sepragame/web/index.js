let initBot = require("./botInit")
const filter = require("../chat/index.js")
const constants = require("../constants.js")

socketio = io // https://socket.io/

function removeTextFormatting(str) {
	// TODO: Move function and regex
	str = str.replace(colorcodeRegex, "")
	str = str.replace(hexcodeRegex, "")
	str = str.replace(internalcodeRegex, "")
	return str
}

const colorcodeRegex = /\\c[0-9]/g
const hexcodeRegex = /(\[#[0-9a-fA-F]{6}\])/g
const internalcodeRegex = /<color:[0-9A-F]{6}>/g

const COLOR_REGEX = /(\[#[0-9a-fA-F]{6}\])/g
function formatHex(input) {
	const match = input.match(COLOR_REGEX)
	if (!match) return input

	match.forEach((colorCode) => {
		let hexCol = colorCode.replace(/[\[#\]]/g, "").toUpperCase()
		hexCol = util.color.rgbToBgr(hexCol)
		input = input.replace(colorCode, `<color:${hexCol}>`)
	})

	return input
}

const characters = {} // for downloading
const nextNetId = { id: 0 }
const rateLimit = new Set()
async function init(io) {
	let users = 0

	// Patch bricks when Game.newBrick is used
	Game.brickFunction = Game.newBrick
	Game.newBrick = function (brick) {
		//TODO newbrick colors scales
		brick.outline = false // Outline is disabled

		brick.a = brick.setPosition
		brick.setPosition = function (position) {
			socketio.emit("bpos", { netId: brick.netId, x: position.x, y: position.y, z: position.z })
			brick.a(position)
		}
		brick.b = brick.setColor
		brick.setColor = function (color) {
			socketio.emit("bc", { netId: brick.netId, c: color })
			brick.b(color)
		}
		brick.c = brick.setScale
		brick.setScale = function (scale) {
			socketio.emit("bs", { netId: brick.netId, x: scale.x, y: scale.y, z: scale.z })
			brick.c(scale)
		}
		brick.setOutline = function (bo) {
			// set outline true or falee
			socketio.emit("boutline", { netId: brick.netId, outline: bo })
			brick.outline = bo
		}
		brick.d = brick.destroy
		brick.destroy = function () {
			socketio.emit("bda", [brick.netId])
			return brick.d()
		}
		return Game.brickFunction(brick)
	}

	Game.messageFunction = Game.messageAll
	Game.messageAll = function (msg) {
		socketio.emit("chat", formatHex(msg))
		return Game.messageFunction(msg)
	}

	setTimeout(() => {
		http.listen(Game.serverSettings.webPort, function () {
			console.log(`Web client is listening on *: ${Game.serverSettings.webPort}`)
		})
	}, 3000)

	app.get("/", function (req, res) {
		res.sendFile(__dirname + "/index.html")
	})

	socketio.on("connection", function (socket) {
		console.log(socket.request.headers)
		if (Game.players.length > 9) {
			socket.emit("gui", [{ type: "centerPrint", text: "\\c6Oops! The game's server is full, please try again later.", time: 999 }]) // The client's playerImpostor has not been created and cannot access the shorter kick function
			socket.disconnect(true)
			return
		}
		users += 1
		webClient.nextNetId.id++
		socket.netId = `${nextNetId.id}`

		socket.emit("netId", socket.netId)
		console.log(`socket is ${socket.netId}`)

		let playerImpostor = new Bot("Browser Player")
		playerImpostor.position = new Vector3(0, 0, -8)

		initBot(playerImpostor)

		let hasAuth = false
		let canChangeUsername = true
		socket.on("permissions", function (key) {
			if (hasAuth === true) return
			if (typeof key.auth !== "string") return
			//if (typeof key.postProcessing !== "boolean") return
			//if (typeof key.glow !== "boolean") return console.log(key)
			if (typeof key.isMobile !== "boolean") return
			if (key.isMobile) {
				playerImpostor.mobile = true
			} else {
				playerImpostor.mobile = false
			}

			if (typeof key.terrainDistance !== "number") return
			hasAuth = true
			if (typeof key.auth === "string") {
				key.auth = key.auth.substr(0, 30)
				if (key.auth === Game.serverSettings.builderPermissionKey) playerImpostor.builderPermission = true
				initClient()
			}
		})

		socket.once("quick", function (search) {
			if (!playerImpostor.builderPermission && Game.serverSettings.sepraType !== "chaotic") return
			try {
				search = search.substr(1, 30)
				search = search.split("/")
				setTimeout(() => {
					playerImpostor.readInstructions = true
					playerImpostor.inSelector = false
					playerImpostor.switchCreature("builder")
					playerImpostor.setPosition(new Vector3(parseInt(search[0]) * 4, parseInt(search[1]) * 4, parseInt(search[2]) * 4))
					playerImpostor.bottomPrint("", 1)
					playerImpostor.socketio.emit("changecamera", "player")
				}, 500)
			} catch (error) {}
		})
		socket.on("getdata", function () {
			// core loading
			let data = {
				brk: [],
				players: characters,
			}
			world.bricks.forEach((b) => {
				data.brk.push({
					position: { x: b.position.x, y: b.position.y, z: b.position.z },
					color: b.color,
					outline: b.outline,
					scale: { x: b.scale.x, y: b.scale.y, z: b.scale.z },
					netId: `${b.netId}`,
				})
			})
			socket.emit("bricks", data)
		})

		function initClient() {
			canChangeUsername = false

			playerImpostor.socketio = socket
			playerImpostor.soundSocket = socket
			playerImpostor.webNetId = socket.netId
			Game.emit("playerJoin", playerImpostor)

			socket.hasRequested = false
			socket.isWaiting = false
			socket.isLinked = false
			console.log("User connected. " + users.toString() + " users connected.")

			socket.on("disconnect", function () {
				users -= 1

				playerImpostor.destroy()
				Game.emit("playerLeave", playerImpostor) // and removes from characters
				Game.messageAll(`\\c6[SERVER]: \\c0${playerImpostor.username} has left the server!`)
				let index = Game.players.indexOf(playerImpostor)
				Game.players.splice(index, 1)

				socketio.emit("users", users)
				socketio.emit("deleteplayer", socket.netId)
				console.log("User disconnected. " + users.toString() + " users connected.")
			})

			// TODO: Check for SheNaNigans
			socket.on("position", function (position) {
				// position from clinet

				if (typeof position.x === "number" && typeof position.y === "number" && typeof position.z === "number" && typeof position.r === "number") {
					// Vaildate
					if (playerImpostor.alive == false) return
					if (!characters[socket.netId]) {
						return console.log(`undefined??`)
					}
					playerImpostor.setRotation(new Vector3(playerImpostor.rotation.x, playerImpostor.rotation.y, position.r))
					playerImpostor.changePosition(new Vector3(position.x, position.y, position.z))
					characters[socket.netId].position = position
					socket.broadcast.emit("pm", { p: position, netId: socket.netId }) // Player movement
				} else {
					//kick
					console.log("I got invaild position data!")
				}
			})

			socket.on("positionclick", function (position) {
				// Same as position but also click

				if (typeof position.x === "number" && typeof position.y === "number" && typeof position.z === "number" && typeof position.r === "number") {
					// Vaildate
					if (playerImpostor.alive == false) return
					if (!characters[socket.netId]) {
						return console.log(`undefined??`)
					}
					playerImpostor.setRotation(new Vector3(playerImpostor.rotation.x, playerImpostor.rotation.y, position.r))
					playerImpostor.changePosition(new Vector3(position.x, position.y, position.z))
					playerImpostor.emit("mouseclick")
					characters[socket.netId].position = position
					socket.broadcast.emit("pm", { p: position, netId: socket.netId }) // Player movement
				} else {
					//kick
					console.log("I got invaild position data!")
				}
			})

			socket.on("keypress", function (key) {
				// Keypresses from the client
				if (typeof key === "string") {
					// Vaildate
					if (key == " ") key = "space"
					if (key == "£") key = "#" // UK (?) to shift + 3
					if (key == '"') key = "@" // UK (?) to shift + 2
					playerImpostor.emit("keypress", key.toLowerCase())
				}
			})

			socket.on("click", function () {
				// Mouseclick
				playerImpostor.emit("mouseclick")
			})

			socket.on("chat", function (message) {
				// The player chats
				if (typeof message === "string") {
					// Vaildate
					message = message.trim()
					if (message.length > 85) message = message.substring(0, 85) + "..."

					if (message.indexOf("/") === 0) {
						const args = message.slice(1).trim().split(" ")
						const commandName = args.shift()
						Game.emit("command", commandName, playerImpostor, args.join(" "))
					} else {
						if (rateLimit.has(playerImpostor.userId)) {
							message = removeTextFormatting(message)
							playerImpostor.message(`\\c2${playerImpostor.username}: ${message}`)
							return playerImpostor.message("You're chatting too fast!")
						}

						rateLimit.add(playerImpostor.userId)
						setTimeout(() => rateLimit.delete(playerImpostor.userId), 2000)

						const remark = filter.isSwear(message)
						if (remark) {
							const swearReplacement = swearReplacements[randomIntFromInterval(0, 4)]
							console.log(`[x]: ${playerImpostor.username}: ${message}`)
							if (remark === true) {
								// Boolean = slient
								playerImpostor.message(`\\c7${removeTextFormatting(playerImpostor.username)}\\c1:\\c0 ` + message)
								if (constants.discordEnabled) disBot.channels.get(channel).send(`${gameName} | ${playerImpostor.currentCreature.discordEmoji} ${playerImpostor.username}: ${swearReplacement}`)
								messageAllExcept(`\\c7${removeTextFormatting(playerImpostor.username)}\\c1:\\c0 ` + swearReplacement, playerImpostor)
								return
							}
							message = removeTextFormatting(message)
							playerImpostor.message(`\\c2${playerImpostor.username}: ${message}`)

							if (constants.discordEnabled) disBot.channels.get(channel).send(`${gameName} | ${playerImpostor.currentCreature.discordEmoji} ${playerImpostor.username}: ${swearReplacement}`)
							Game.messageAll(`\\c7${removeTextFormatting(playerImpostor.username)}\\c1:\\c0 ` + swearReplacement)
							return playerImpostor.message("Don't swear! Your message has not been sent.")
						}

						console.log(`${playerImpostor.username}: ${message}`)
						Game.emit("chatted", playerImpostor, message)
						playerImpostor.emit("chatted", message)
						Game.messageAll(`\\c7${removeTextFormatting(playerImpostor.username)}\\c1:\\c0 ` + message)
					}
				}
			})

			playerImpostor.emit("initialSpawn")
		}
	})
}

function messageAllExcept(message, player) {
	Game.players.forEach((other) => {
		if (player !== other) other.message(message)
	})
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = { init, socketio, characters, nextNetId } // akrok
