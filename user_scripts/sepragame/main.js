// main.js
const sepragame = {}

function init(VM_GLOBALS) {
	// General utils
	noop = function () {}
	createPromise = function createPromise() {
		// Creates a promise that has a resolve function
		let promise = new Promise((resolve) => {
			var res = resolve
		})
		promise.resolve = res
		return promise
	}

	// VM
	Game = VM_GLOBALS.Game
	Vector3 = VM_GLOBALS.Vector3
	Bot = VM_GLOBALS.Bot
	Brick = VM_GLOBALS.Brick
	PacketBuilder = VM_GLOBALS.PacketBuilder
	Outfit = VM_GLOBALS.Outfit
	Team = VM_GLOBALS.Team
	Tool = VM_GLOBALS.Tool
	sleep = VM_GLOBALS.sleep
	debounce = VM_GLOBALS.debounce
	world = VM_GLOBALS.world
	soundbrick = VM_GLOBALS.soundbrick
	util = VM_GLOBALS.util
	AssetDownloader = VM_GLOBALS.AssetDownloader

	AssetDownloader.getAssetData = function (id) {
		return new Promise((resolve, reject) => {
			if (!id || id === 1) {
				resolve({
					mesh: null,
					texture: null,
				})
			}
			resolve({
				mesh: `mol_${id}`,
				texture: `tex_${id}`,
			})
		})
	}

	Discord = require("discord.js")
	express = require("express")
	ndarray = require("ndarray")
	app = express()
	app.use("/", express.static(require("path").join(__dirname, "/web/static")))
	http = require("http").Server(app)
	//console.log(io)
	let path = "/socket.io"
	io = require("socket.io")(http, {
		path: path,
	})
	fs = require("fs")

	// Discord.js
	bot = new Discord.Client({ disableEveryone: true })
	disBot = bot // Alias
	if (Game.serverSettings.botToken) bot.login(Game.serverSettings.botToken)
	// FTODO: server settings
	channel = Game.serverSettings.botChannel
	bot.on("error", console.error)

	EventEmitter = require("events")
	// Classes
	Tickable = require("./class/tickable.js")
	Reflector = require("./class/reflector.js")
	addReflector = function (obj) {
		world.reflectors.push(obj)
	}
	Portal = require("./class/portal.js")
	addPortal = function (obj) {
		world.portals.push(obj)
	}

	// Add portals
	//addPortal(new Portal(new Vector3(-123, 277, 264), new Vector3(-214, 425, 288), 8))
	// addPortal(new Portal(new Vector3(-152, -374, 338), new Vector3(314, 520, 88), 8))
	// addPortal(new Portal(new Vector3(229, 564, 89), new Vector3(159, 765, 314), 15))
	// Attacks
	Attack = require("./attacks/attack.js")

	// Clients

	webClient = require("./web/index.js")
	webClient.init(io)

	// Patching
	patcher = require("./funct/patcher.js")

	// Get bricks from brk
	SELbrick1 = world.bricks.find((br) => br.name == "sgs1")
	SELbrick2 = world.bricks.find((br) => br.name == "sgs2")
	SELbrick3 = world.bricks.find((br) => br.name == "sgs3")

	gameName = "sepragame"
	Game.systemMessages = false

	debug = -57.2957795 // (misleading name) Degree to radiant conversion constant
	queue = [] // for reusehandler
	bots = [] // for bot stuff

	voxelWorld = require("./voxel/voxelWorld.js")

	reuseHandler = require("./reuse/reuseHandler.js")
	collisionOutTerrain = require("./funct/collisionOutTerrain.js") // For bot Ai
	inBlock = require("./funct/inBlock.js") // Check if position is inside non-air block
	getBlockType = require("./funct/getBlockType.js") // Get block type on position
	errorHandler = noop
	testforHit = require("./funct/testforHit.js")
	damageHandler = require("./funct/damageHandler.js")
	charAnimate = require("./funct/charAnimate.js")
	botManager = require("./bot/botManager.js")

	stepSoundSets = require("./sound/index.js")

	reuseHandler.initqueue()

	creatureData = require("./creature/creatureData.js")

	defaultCreature = "none"

	particleManager = require("./effects/particleManager.js")

	initalSelectionTree = require("./selectorTree.js")

	selectorData = [
		{
			creatureName: "Back",
			saveID: "ico-back",
			description: "",
			charmodel: {
				hat1: 5192006,
				animNone: 50,
			},
			webModelRotationOffset: 1.565, // For the visual model
			webLogicRotationOffset: 0, // For converting BH rotation
			webNetworkRotationOffset: 1.565, // for other player's model
			class: "icon",

			trigger: triggerBackToMain,
		},
	]

	function triggerBackToMain(p) {
		p.selectorData = initalSelectionTree
		p.updateSelector()
	}

	// Convert the creatureData array to a selector refer
	creatureData.forEach((element) => {
		if (element.showInSelector == true) {
			selectorData.push(element)
		}
	})

	particleData = particleManager.getpar()

	Game.command("morph", (p, msg) => {
		if (p.currentCreature.class === "builder") p.setPosition(new Vector3(randomIntFromInterval(-500, 500), randomIntFromInterval(-500, 500), 500))
		p.switchCreature(msg)
	})

	function clamp(num, min, max) {
		return Math.max(Math.min(num, max), min)
	}

	class BarGenerator {
		/**/
		constructor(props) {
			this.fullColor = props.fullColor ?? "\\c5"
			this.emptyColor = props.emptyColor ?? "\\c0"
			this.character = props.character ?? "="
			this.emptyCharacter = props.emptyCharacter ?? this.character
			this.barLength = props.barLength ?? 4
		}

		generate(quantity, maxQuantity) {
			// Give us a percentage represented in integer number of bars
			quantity = Math.min(quantity, maxQuantity)
			const percentageFull = Math.max(Math.floor((quantity / maxQuantity) * this.barLength), 0)
			const remainingEmpty = this.barLength - percentageFull

			if (percentageFull) {
				return this.fullColor + this.emptyCharacter.repeat(percentageFull) + this.emptyColor + this.character.repeat(remainingEmpty)
			} else {
				return this.character.repeat(remainingEmpty)
			}
		}
	}

	const hBar = new BarGenerator({
		fullColor: "[#FF6A00]",
		emptyColor: "[#7F3300]",
		barLength: 8,
		character: ". ",
	})

	const pBar = new BarGenerator({
		fullColor: "[#FFD800]",
		emptyColor: "[#7F6A00]",
		barLength: 8,
		character: ". ",
	})

	Game.command("respawn", (p, msg) => {
		p.setHealth(0)
	})

	Game.command("settings", (p, msg) => {
		//p.message("\\c7Brick Quailty: /brk [performance-quailty]")
		p.message("\\c7Terrain View Distance: /viewdistance [1-8]")
		//p.message("\\c7Post Processing: /pp [on-off]")
		p.message("\\c7Glow: /glow [on-off]") // \\c2(Requires post processing)
		//p.message("\\c7Enable or disable mobile controls: /joystick [on-off]") // \\c2(Requires post processing)
		//p.message("\\c7Ambient Occlusion: /ssao [on-off] \\c2(Requires post processing)")
	})

	Game.command("glow", (p, msg) => {
		if (msg === "off") {
			p.message("Glow bricks has been turned off!")
			p.message("Refresh the page to apply these changes")
			p.socketio.emit("saveKey", "sepragame.settings.glow", false)
		} else if (msg === "on") {
			p.message("Glow bricks has been turned on!")
			p.message("Refresh the page to apply these changes")
			p.socketio.emit("saveKey", "sepragame.settings.glow", true)
		} else {
			p.message("\\c6Incorrect command usage!")
			p.message("\\c7Glow: /glow [on-off]")
		}
	})

	Game.command("god", (p, msg) => {
		p.message("active")
		p.godMode = true
	})

	function commandKeyAlias(commandName, key) {
		Game.command(commandName, (player, args) => {
			player.emit("keypress", key)
		})
	}
	commandKeyAlias("x", "x")
	commandKeyAlias("mark", "x")
	commandKeyAlias("spray", "x")
	commandKeyAlias("selectorpoint1", "!")
	commandKeyAlias("selectorpoint2", "@")

	require("./player/player.js")

	Game.command("spawnbot", (caller, creatureid) => {
		// Spawns in a bot
		var botData = botManager.bots.find((x) => x.saveID == creatureid)
		if (botData == undefined || botData == -1) return
		botManager.spawnBot(botData, caller.position)
	})

	spawnFruit = require("./class/fruit.js")

	Game.command("fruit", (caller, creatureid) => {
		// Spawns in a bot
		spawnFruit(caller.position)
	})

	randomIntFromInterval = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

	findTopSurfaceOfWorld = function (position) {
		const pickX = Math.floor(position.x / 4)
		const pickY = Math.floor(position.y / 4)
		let result = 4

		loop: {
			for (let x = 0; x < 5; x++) {
				for (let y = 0; y < 5; y++) {
					for (let z = 200; z > 3; z--) {
						var block = voxelWorld.world.getBlockType(new Vector3(pickX + x, pickY + y, z))

						switch (block) {
							case 0:
								break
							default:
								result = z * 4
								break loop
						}
					}
				}
			}
		}

		return result + 4
	}

	var fruitSpawner = setInterval(() => {
		// fruit spawner and despawner
		if (world.fruit.length < 10) {
			Game.players.forEach(async (player) => {
				if (player.currentCreature === undefined) return
				if (player.currentCreature.class !== "builder") {
					let x = Math.floor((randomIntFromInterval(-160, 160) + player.position.x) / 4) * 4 + 1.5
					let y = Math.floor((randomIntFromInterval(-160, 160) + player.position.y) / 4) * 4 + 1.5
					let canSpawn = !world.fruit.some((fruit) => Game.pointDistance3D(new Vector3(x, y, player.position.z), fruit.position) < 200)
					if (canSpawn === true) {
						let surface = findTopSurfaceOfWorld(new Vector3(x, y, 0))
						if (randomIntFromInterval(0, 1)) {
							let fruit = spawnFruit(new Vector3(x, y, surface))
							if (fruit) {
								let fruitDespawn = setInterval(() => {
									if (!Game.players.some((player) => Game.pointDistance3D(new Vector3(fruit.position.x, fruit.position.y, fruit.position.z), player.position) < 250)) {
										if (fruit.persistent) return
										fruit.remove()
										clearInterval(fruitDespawn)
									}
								}, 3000)
							}
						} else {
							let fruit = spawnFruit(new Vector3(x, y, surface), ["#ff4dff", "#ffb3ff"])
							fruit.eat = function (creature) {
								if (creature.isBot) {
								} else {
									creature.centerPrint(`Unstable energy! (4s)`, 4)
									let hp = creature.health
									creature.changeEnergy(30)
									for (let index = 0; index < 4; index++) {
										setTimeout(() => {
											creature.changeEnergy(100)
											soundbrick({
												url: `/sounds/ready.flac`,
												isGlobal: false,
												position: creature.position,
											})
										}, 1000 * index)
									}
									for (let index = 0; index < 400; index++) {
										setTimeout(() => {
											let newHp = creature.health * 0.9
											if (newHp > 1) creature.setHealth(newHp)
										}, 10 * index)
									}
									setTimeout(() => {
										creature.setHealth(hp)
									}, 5000)

									creature.changeStamina(400)
								}

								soundbrick({
									url: `/sounds/eat/bodyexplode.flac`,
									isGlobal: false,
									position: creature.position,
								})

								for (let index = 0; index < 5; index++) {
									let color = fruit.color
									setTimeout(() => {
										const drippyPosition = new Vector3()
										drippyPosition.x = creature.position.x + creature.currentCreature.charmodel.mouth.x * Math.sin(creature.rotation.z / debug)
										drippyPosition.y = creature.position.y - +creature.currentCreature.charmodel.mouth.x * Math.cos(creature.rotation.z / debug)
										drippyPosition.z = creature.position.z + creature.currentCreature.charmodel.mouth.y - 0.8
										particleManager.emitParticle("drippy", {
											position: drippyPosition,
											color: color,
											directionalForce: 0,
											direction: 0,
											expire: 200,
										})
									}, 800 * index)
								}
								soundbrick({
									url: `/sounds/generalExplosion1.flac`,
									isGlobal: false,
									position: creature.position,
								})

								soundbrick({
									url: `/sounds/eat/${randomIntFromInterval(1, 4)}.flac`,
									isGlobal: false,
									position: creature.position,
								})
								fruit.drop(creature, false)
								fruit.remove()
							}
							if (fruit) {
								let fruitDespawn = setInterval(() => {
									if (!Game.players.some((player) => Game.pointDistance3D(new Vector3(fruit.position.x, fruit.position.y, fruit.position.z), player.position) < 250)) {
										if (fruit.persistent) return
										fruit.remove()
										clearInterval(fruitDespawn)
									}
								}, 3000)
							}
						}
					}
				}
			})
		}
	}, 1000)
	const notWeakling = ["guna", "magmeer"] // saveID
	const botLoop = setInterval(() => {
		// Wild bot spawner
		if (botManager.ingameBots.length < 10) {
			Game.players.forEach((player) => {
				if (player.currentCreature === undefined) return
				if (player.currentCreature.class === "builder") return
				const x = randomIntFromInterval(-250, 250) + player.position.x
				const y = randomIntFromInterval(-250, 250) + player.position.y
				const canSpawn = Game.pointDistance3D(new Vector3(x, y, player.position.z), player.position) > 25 && !botManager.ingameBots.some((bot) => Game.pointDistance3D(bot.position, player.position) < 120 && bot.alive === true)
				if (canSpawn === true) {
					if (randomIntFromInterval(0, 100) > 75) {
						// Chance to spawn in a non weakling creature
						const numb = randomIntFromInterval(0, notWeakling.length - 1)
						try {
							const botData = botManager.bots.find((element) => element.saveID === notWeakling[numb]) // Get AI
							botManager.spawnBot(botData, new Vector3(x, y, 1024))
						} catch (error) {
							console.log(error)
							console.log({ numb })
						}
					} else {
						const n = randomIntFromInterval(1, 2)
						const botData = botManager.bots.find((element) => element.saveID === `weakling${n}`) // Get AI
						botManager.spawnBot(botData, new Vector3(x, y, 1024))
					}
				}
			})
		}
	}, 1000)
}

module.exports = { sepragame, init }
