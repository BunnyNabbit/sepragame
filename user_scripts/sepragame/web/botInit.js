// This / adds / patches / replaces / extends / or whatever / players functions to a bot tuned for the web based client
// Use only on bots

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

const COLOR_REGEX = /(\[#[0-9a-fA-F]{6}\])/g

function formatHex(input) {
	const match = input.match(COLOR_REGEX)
	if (!match) return input

	match.forEach((colorCode) => {
		let hexCol = colorCode.replace(/[\[#\]]/g, "").toUpperCase()
		//hexCol = util.color.rgbToBgr(hexCol)
		input = input.replace(colorCode, `<color:${hexCol}>`)
	})

	return input
}
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

// Web client: Put all the functions and variables into a node-hill Bot to mock a node-hill Player
function init(playerImpostor) {
	playerImpostor.authenticated = true
	playerImpostor.alive = true
	playerImpostor.muted = false
	playerImpostor.health = 100
	playerImpostor.maxHealth = 100
	playerImpostor.netId = randomIntFromInterval(1000, 9999)
	playerImpostor.username = `Browser Player ${playerImpostor.netId}`
	playerImpostor.userId = randomIntFromInterval(1000, 99999)
	playerImpostor.score = 0
	playerImpostor.membershipType = 1
	playerImpostor.admin = false
	playerImpostor.jumpPower = 5 // i think?
	playerImpostor.speed = 4
	playerImpostor.localBricks = []
	playerImpostor.blockedUsers = []
	playerImpostor.socket = {}
	playerImpostor.socket.destroyed = false
	playerImpostor.socket.write = function (a, b, resolve) {
		resolve()
	}
	playerImpostor.rotation - new Vector3(0, 0, 0)
	playerImpostor.assets = {
		tool: 0,
		face: 0,
		hat1: 0,
		hat2: 0,
		hat3: 0,
	}
	playerImpostor.colors = {
		head: "#d9bc00",
		torso: "#d9bc00",
		leftArm: "#d9bc00",
		rightArm: "#d9bc00",
		leftLeg: "#d9bc00",
		rightLeg: "#d9bc00",
	}
	playerImpostor.toolEquipped = null
	playerImpostor.inventory = []

	playerImpostor.message = function (msg) {
		if (removeTextFormatting(msg) === "[V2]: This server uses Cheats' V2 Commands.") return
		playerImpostor.socketio.emit("chat", formatHex(msg))
	}

	playerImpostor.topPrint = function (msg, time = 1) {
		playerImpostor.socketio.emit("gui", [{ type: "topPrint", text: formatHex(msg), time: time }])
	}

	playerImpostor.bottomPrint = function (msg, time = 1) {
		playerImpostor.socketio.emit("gui", [{ type: "bottomPrint", text: formatHex(msg), time: time }])
	}

	playerImpostor.centerPrint = function (msg, time = 1) {
		playerImpostor.socketio.emit("gui", [{ type: "centerPrint", text: formatHex(msg), time: time }])
	}

	playerImpostor.setHealth = function (newHp) {
		playerImpostor.health = newHp
		if (playerImpostor.health > playerImpostor.maxHealth) playerImpostor.health = playerImpostor.maxHealth
		playerImpostor.socketio.emit("gui", [{ type: "health", value: (playerImpostor.health / playerImpostor.maxHealth) * 100 }])
		if (playerImpostor.alive == true) {
			if (playerImpostor.health <= 0) {
				playerImpostor.emit("died")
				playerImpostor.alive = false
				setTimeout(() => {
					playerImpostor.socketio.emit("setposition")
					playerImpostor.alive = true
					playerImpostor.emit("respawn")
				}, 5000)
			}
		}
	}

	playerImpostor.setJumpPower = function (msg) {
		//TODO
	}

	playerImpostor.setCameraPosition = function (msg) {
		//TODO
	}

	playerImpostor.setCameraRotation = function (msg) {
		//TODO
	}

	playerImpostor.kick = function (reason) {
		playerImpostor.centerPrint(`\\c6${reason}`, 999)
		playerImpostor.socketio.disconnect(true)
	}

	playerImpostor.kill = function (msg) {
		//TODO
	}

	playerImpostor.respawn = function (msg) {
		//TODO
	}

	playerImpostor.setCameraFOV = function (msg) {
		//TODO
	}

	playerImpostor.setCameraObject = function (msg) {
		//TODO
	}

	playerImpostor.setCameraDistance = function (msg) {
		//TODO
	}

	playerImpostor.setEnvironment = function (env) {
		if (env.skyColor) {
			playerImpostor.socketio.emit("sky", env.skyColor)
		}
	}

	playerImpostor.keypress = function (callback) {
		let kpCallback = (key) => {
			callback(key)
		}
		this.on("keypress", kpCallback)
		return {
			disconnect: () => this.off("keypress", kpCallback),
		}
	}

	playerImpostor.mouseclick = function (callback) {
		let clickCallback = () => {
			callback()
		}
		this.on("mouseclick", clickCallback)
		return {
			disconnect: () => this.off("mouseclick", clickCallback),
		}
	}

	playerImpostor.prompt = function (msg) {
		//TODO: Maybe use alert()?
	}

	playerImpostor.setRotation = function (msg) {
		playerImpostor.rotation = msg
	}

	playerImpostor.setPosition = function (msg, slippery = false) {
		// This one does however.
		playerImpostor.position = msg
		new PacketBuilder("Figure").write("uint32", playerImpostor.netId).write("string", "ABC").write("float", playerImpostor.position.x).write("float", playerImpostor.position.y).write("float", playerImpostor.position.z).broadcast()
		playerImpostor.socketio.emit("setPosition", { x: playerImpostor.position.x, y: playerImpostor.position.z, z: playerImpostor.position.y, s: slippery })
	}

	playerImpostor.debugText = function (text, pos) {
		playerImpostor.socketio.emit("debugText", { x: pos.x, y: pos.z, z: pos.y }, text)
	}

	playerImpostor.debugPos = function (pos) {
		playerImpostor.socketio.emit("debugPos", { x: pos.x, y: pos.z, z: pos.y })
	}

	playerImpostor.debugLine = function (positions) {
		const cleanPositions = []
		positions.forEach((position) => {
			cleanPositions.push({ x: position.x, y: position.z, z: position.y })
		})
		playerImpostor.socketio.emit("debugLine", cleanPositions)
	}

	playerImpostor.changePosition = function (msg) {
		// Doesn't tell the client their position!
		playerImpostor.position = msg
		playerImpostor.emit("moved")
		new PacketBuilder("Figure").write("uint32", playerImpostor.netId).write("string", "ABC").write("float", playerImpostor.position.x).write("float", playerImpostor.position.y).write("float", playerImpostor.position.z).broadcast()
	}

	playerImpostor.getBlockedPlayers = function () {
		return []
	}

	playerImpostor.hovering = false
	playerImpostor.setHover = function (bool) {
		playerImpostor.hovering = bool
		playerImpostor.socketio.emit("hover", bool)
	}

	playerImpostor.guiSelectSlot = function (slot) {
		// Hi lights the 1 only slot. 0 or null for no slot [1,2,3,4,5]
		let send = []
		if (slot != 1 && playerImpostor.atk1Cooldown < 0) send.push({ type: "slot", number: 1, inner: "selection", value: "unselected" })
		if (slot != 2 && playerImpostor.atk2Cooldown < 0) send.push({ type: "slot", number: 2, inner: "selection", value: "unselected" })
		if (slot != 3 && playerImpostor.atk3Cooldown < 0) send.push({ type: "slot", number: 3, inner: "selection", value: "unselected" })
		if (slot != 4 && playerImpostor.atk4Cooldown < 0) send.push({ type: "slot", number: 4, inner: "selection", value: "unselected" })
		if (slot != 5 && playerImpostor.atk5Cooldown < 0) send.push({ type: "slot", number: 5, inner: "selection", value: "unselected" })

		if (playerImpostor[`atk${slot}Cooldown`] < 0) send.push({ type: "slot", number: slot, inner: "selection", value: "selected" })
		playerImpostor.socketio.emit("gui", send)
	}

	playerImpostor.newBrick = function (brick) {
		//TODO: networking
		let localBrick = brick.clone()
		//localBrick.socket = this.socket
		playerImpostor.localBricks.push(localBrick)
		//const packet = new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.SendBrick)
		//scripts.addBrickProperties(packet, localBrick)
		//yield packet.send(this.socket)

		return localBrick
	}
	playerImpostor.deleteBricksWeb = function (bricks) {
		//playerImpostor.rotation = msg
		//console.log(bricks.length)
		let data = []
		bricks.forEach((b) => {
			data.push(b.netId)
			b.destroyed = true
		})
		playerImpostor.socketio.emit("bda", data)
	}
	playerImpostor.loadBricks = function (bricks) {
		//playerImpostor.rotation = msg
		//console.log(bricks.length)
		let data = {
			brk: [],
			players: [],
		}
		bricks.forEach((b) => {
			if (b.outline == undefined) b.outline = true
			data.brk.push({
				position: { x: b.position.x, y: b.position.y, z: b.position.z },
				color: b.color,
				outline: false,
				scale: { x: b.scale.x, y: b.scale.y, z: b.scale.z },
				netId: `${b.netId}`,
			})
		})
		playerImpostor.socketio.emit("bricks", data)
	}

	playerImpostor.setSpeed = function (msg) {
		playerImpostor.socketio.emit("mod", { type: "speed", value: msg })
		//TODO
	}

	Game.players.push(playerImpostor)
}

module.exports = init
