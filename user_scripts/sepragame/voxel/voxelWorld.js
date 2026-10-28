var colorbyid = require("./color/blockColors.js")
var VoxWorld = require("./voxel-world/LegacyMongoWorld.cjs")
// var canvas = require("canvas")

const dataCache = {
	playerData: {},
	chunkData: {},
	cacheData: {},
}
const saveQueue = {
	playerData: {},
	chunkData: {},
	cacheData: {},
	saveGlobal: false,
}

let blockLogAdd = 0
let blockLogRemove = 0
// Ensure required directories exist
require("fs").mkdirSync(`./voxelStorage/${Game.serverSettings.sepraType}/cache`, {
	recursive: true,
})
require("fs").mkdirSync(`./voxelStorage/${Game.serverSettings.sepraType}/savedata/chunkmeta`, {
	recursive: true,
})
const globalDataPath = `./voxelStorage/${Game.serverSettings.sepraType}/savedata/global.json`
var globalData = {
	globalBlocksAdded: 0,
	mapRenderQueue: {},
}

if (fs.existsSync(globalDataPath)) {
	try {
		globalData = JSON.parse(fs.readFileSync(globalDataPath).toString())
	} catch (error) {
		console.error("Error when reading global data.", error)
		process.exit(1)
	}
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function generateSection(sectionPos) {
	const blockPos = new Vector3(sectionPos.x * 32, sectionPos.y * 32, sectionPos.z * 32)
	for (var x = 0; x < 32; x++) {
		for (var z = 0; z < 32; z++) {
			for (var y = 0; y < 32; y++) {
				if (sectionPos.z * 32 + z <= 63) {
					voxelworld.setBlockType(new Vector3(blockPos.x + x, blockPos.y + y, blockPos.z + z), 16) // Black
				}
			}
		}
	}
}

const voxelworld = new VoxWorld({ saveLocation: `./voxelStorage/${Game.serverSettings.sepraType}/voxelWorld/` }, generateSection)
const brickMesher = require("./brickMesher.js")
const WorldReader = require("./voxelReaders/WorldReader.js")
const CulledWorldReader = require("./voxelReaders/CulledWorldReader.js")
const VoxReader = require("./voxelReaders/VoxReader.js")
const WorldmapReader = require("./voxelReaders/ImagemapReader.js")
async function render(sectionX, sectionY, sectionZ, player, reload) {
	// Get a world section meshed wih brircks
	// if (section < 0) return
	// if (section > 7) return
	let brickArray = []
	let clusterData = {
		x: sectionX,
		y: sectionY,
		z: sectionZ,
		loaded: false,
		bricks: brickArray,
	}

	// If the request is to reload a section by meshing a new version of the section then donnt'
	let toDelete = "no" // todo: yes
	// TODO: figure out what above todo even meant
	let confirmed = true
	if (reload == true) {
		var verify = player.loadedchunks.some((i) => i.x == clusterData.x && i.y == clusterData.y && i.z == clusterData.z && i.loaded == true)
		if (verify == true) {
			toDelete = player.loadedchunks.find((i) => i.x == clusterData.x && i.y == clusterData.y && i.z == clusterData.z && i.loaded == true)
			confirmed = false
		} else {
			confirmed = true
		}
	} else {
		var verify = player.loadedchunks.some((i) => i.x == clusterData.x && i.y == clusterData.y && i.z == clusterData.z)
		if (verify == false) confirmed = false
	}
	if (confirmed == true) return

	player.loadedchunks.push(clusterData)

	// Caches, do not load from cache if chunk is reloading
	let loadfromcache = false
	if (reload == false) {
		// Read cache
		if (dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`] !== undefined) {
			// Is the region in memory?
			if (dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`][`${sectionX} ${sectionY} ${sectionZ}`] !== undefined) {
				// Does the section exist?
				loadfromcache = true

				var data = dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`][`${sectionX} ${sectionY} ${sectionZ}`]
				var bricks = []
				data.forEach((element) => {
					var brick = new Brick(element.position, element.scale, element.color)
					if (element.visibility == 0.5) {
						brickArray.push(brick)
					} else {
						brickArray.push(brick)
					}
					brick.collision = element.collision
					bricks.push(brick)
				})
				clusterData.loaded = true
				if (bricks.length !== 0) {
					let cluster = {
						p: `${sectionX} ${sectionY} ${sectionZ}`,
						position: { x: sectionX, y: sectionY, z: sectionZ },
						b: lightenBricks(bricks),
					}
					return cluster
				}
				return
			} else {
				// Section wasn't in region. Mesh a section from the world.
				loadfromcache = false
			}
		} else {
			// Region wasn't in memory. Read from disk
			if (fs.existsSync(`./voxelStorage/${Game.serverSettings.sepraType}/cache/${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}.json`) == true) {
				try {
					var json = fs.readFileSync(`./voxelStorage/${Game.serverSettings.sepraType}/cache/${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}.json`).toString()

					var data = JSON.parse(json)
					dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`] = data
					if (data[`${sectionX} ${sectionY} ${sectionZ}`] !== undefined) {
						// Is a section in region?
						data[`${sectionX} ${sectionY} ${sectionZ}`].forEach((element) => {
							// Send all the bricks!
							var brick = new Brick(element.position, element.scale, element.color)
							if (element.visibility == 0.5) {
								brickArray.push(brick)
							} else {
								brickArray.push(brick)
							}
							brick.collision = element.collision
						})
						loadfromcache = true
						clusterData.loaded = true
						if (brickArray.length !== 0) {
							// Web client
							let cluster = {
								p: `${sectionX} ${sectionY} ${sectionZ}`,
								position: { x: sectionX, y: sectionY, z: sectionZ },
								b: lightenBricks(brickArray),
							}
							return cluster
						}
						return
					} else {
						loadfromcache = false // Section wasn't in region. Mesh a section from the world.
					}
				} catch (error) {
					loadfromcache = false
					console.warn(`Unable to load caching region ${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}.json! Rebuilding cache`)
					player.message(`\\c6Unable to load caching region ${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}.json! Rebuilding cache`)
					console.error(error)
				}
			}
		}
	}
	if (loadfromcache == true) return // If loaded from cache, do not begin meshing

	// Mesh bricks
	if (meshMode) {
		var normalBricks = await brickMesher(new WorldReader(sectionX * 32, sectionY * 32, sectionZ * 32, 32, 32, 32, voxelworld))
		var culledBricks = await brickMesher(new CulledWorldReader(sectionX * 32, sectionY * 32, sectionZ * 32, 32, 32, 32, voxelworld))
		if (normalBricks.length >= culledBricks.length) {
			brickArray = culledBricks
		} else {
			brickArray = normalBricks
		}
	} else {
		var normalBricks = await brickMesher(new WorldReader(sectionX * 32, sectionY * 32, sectionZ * 32, 32, 32, 32, voxelworld))
		brickArray = normalBricks
	}

	brickArray.forEach((brick) => {
		brick.position.x += sectionX * 128
		brick.position.y += sectionY * 128
		brick.position.z += sectionZ * 128
	})
	//brickarray = await brickMesher(new WorldmapReader(chunkx * 16, section * 16, chunky * 16, 16, 16, ctx))
	clusterData.bricks = brickArray

	// If reloading, remove chunks to replace
	if (reload == true) {
		if (toDelete == "no") return console.log("it said no")
		if (toDelete == undefined) return console.log("it undefindd")
		player.loadedchunks.splice(player.loadedchunks.indexOf(toDelete), 1)
	}

	// Save meshed bricks to cache
	if (loadfromcache == false) {
		let brickdata = []
		brickArray.forEach((element) => {
			brickdata.push({ scale: element.scale, position: element.position, color: element.color, visibility: element.visibility, collision: element.collision })
		})

		if (dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`] !== undefined) {
			dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`][`${sectionX} ${sectionY} ${sectionZ}`] = brickdata
			saveQueue.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`] = true
		} else {
			if (fs.existsSync(`./voxelStorage/${Game.serverSettings.sepraType}/cache/${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}.json`) == true) {
				try {
					var json = fs.readFileSync(`./voxelStorage/${Game.serverSettings.sepraType}/cache/${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}.json`).toString()

					var data = JSON.parse(json)
					dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`] = data
					dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`][`${sectionX} ${sectionY} ${sectionZ}`] = brickdata
					saveQueue.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`] = true // Mark cache as changed, the autosaver will save it later.
				} catch (error) {
					console.error("Oh no!", error)
				}
			} else {
				dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`] = {}
				dataCache.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`][`${sectionX} ${sectionY} ${sectionZ}`] = brickdata
				saveQueue.cacheData[`${Math.floor(sectionX / 32)} ${Math.floor(sectionY / 32)} ${Math.floor(sectionZ / 32)}`] = true // Mark cache as changed, the autosaver will save it later.
			}
		}
	}

	// Send bricks
	if (brickArray[0] !== undefined) {
		player.socketio.emit(
			"t",
			clusterSerialize([
				{
					// Clusters
					p: `${sectionX} ${sectionY} ${sectionZ}`,
					position: { x: sectionX, y: sectionY, z: sectionZ },
					b: lightenBricks(brickArray),
				},
			])
		)
		if (reload === true) {
			// Send reload to web clients
			Game.players.forEach((client) => {
				if (client.loadedchunks.some((i) => i.x == sectionX && i.y == sectionY && i.z == sectionZ && i.loaded == true)) {
					client.socketio.emit(
						"t",
						clusterSerialize([
							{
								// Clusters
								p: `${sectionX} ${sectionY} ${sectionZ}`,
								position: { x: sectionX, y: sectionY, z: sectionZ },
								b: lightenBricks(brickArray),
							},
						])
					)
				}
			})
		}
	} else {
		if (reload === true) {
			// Send reload to web clients
			player.socketio.emit("dt", `${sectionX} ${sectionY} ${sectionZ}`)
			Game.players.forEach((client) => {
				if (client.loadedchunks.some((i) => i.x == sectionX && i.y == sectionY && i.z == sectionZ && i.loaded == true)) {
					client.socketio.emit("dt", `${sectionX} ${sectionY} ${sectionZ}`)
				}
			})
		}
	}

	clusterData.loaded = true
}
function lightenBricks(bricks) {
	let lightBricks = []
	bricks.forEach((brick) => {
		lightBricks.push({
			collision: brick.collision,
			position: { x: brick.position.x, y: brick.position.y, z: brick.position.z },
			scale: { x: brick.scale.x, y: brick.scale.y, z: brick.scale.z },
			color: brick.color,
			outline: false,
			netId: "",
		})
	})
	return lightBricks
}

playerchangecolor = function () {}

Game.on("playerJoin", async (player) => {
	player.userData = await getPlayerData(player.userId)
	if (player.userData.error == true || player.userData.error == undefined) {
		player.kick("Orphaned")
	}
	player.lastChunk = new Vector3(999, 999, 999) // Performance

	player.userData.lastGlobalBlocks = globalData.globalBlocksAdded
	player.scafolding = []
	player.lastVaildPosition = new Vector3(0, 0, 500)
	player.loadTool = false

	player.viewDistanceN = -1 // 3x3x3
	player.viewDistanceP = 2 // | | |
	player.viewDistanceToggle = 3
	player.viewDistanceN = -2
	player.viewDistanceP = 3
	player.blockData = 0
	player.selectedColor = 9
	player.blockHeightPlacement = 0
	player.blockDistancePlacement = 8
	player.blockPlacementMode = 1 // 1 = normal far 2 = closest
	player.colormode = "simple"
	player.symmetryEnabled = false
	player.symmetryAxis = "x"
	player.symmetryOrigin = new Vector3(0, 80, 0)

	player.toolModeIndex = 0
	//player.toolHolding = "none"

	player.modCheck = "none"

	player.boosterTime = 0
	player.boosterType = "none"

	player.unredeemedCrystals = 0
	player.redeemerLocatorBrick = new Brick(new Vector3(0, 0, 0), new Vector3(1, 1, 1), "#ff0000")
	player.redeemlocatorFocusPoint = new Vector3(0, 0, 0)
	player.redeemerLocatorEnabled = false
	player.newBrick(player.redeemerLocatorBrick)

	player.loadedchunks = []
	player.plchunkx = Math.floor(player.position.x / 64)
	player.plchunky = Math.floor(player.position.y / 64)
	player.plchunkz = Math.floor(player.position.z / 64)

	playerchangecolor(player)
	player.selectorBrick = new Brick(new Vector3(4, 4, 4), new Vector3(4, 4, 4), "#c0c0cf")
	player.selectorBrickMirrored = new Brick(new Vector3(4, 4, 4), new Vector3(4, 4, 4), "#c0c0cf")
	player.selectionBox = new Brick(new Vector3(4, 4, 4), new Vector3(4, 4, 4), "#c0c0cf")
	player.selectionPoint1 = new Vector3(0, 0, -10000) // Block coords
	player.selectionPoint2 = new Vector3(0, 0, -10000)
	player.undoBuffer = {
		undo: [],
		redo: [],
		add: function (type, data, position) {
			player.undoBuffer.undo.push([type, data, position])
			if (player.undoBuffer.undo.length > 25000) player.undoBuffer.undo.shift()
			player.undoBuffer.redo = []
		},
		applyUndo: async function (count) {
			const times = Math.min(player.undoBuffer.redo.length + 1, 64)
			for (let i = 0; i < times; i++) {
				if (player.undoBuffer.undo.length) {
					const blockInfo = player.undoBuffer.undo[player.undoBuffer.undo.length - 1]
					const blockType = blockInfo[0]
					const blockData = blockInfo[1]
					const position = blockInfo[2]
					const oldBlockType = await voxelworld.getBlockType(position)
					const oldBlockData = await voxelworld.getBlockData(position)
					player.undoBuffer.redo.push([oldBlockType, oldBlockData, position])
					player.undoBuffer.undo.pop()
					await voxelworld.setBlockType(position, blockType)
					await voxelworld.setBlockData(position, blockData)
					const chunkX = Math.floor(position.x / 32)
					const chunkY = Math.floor(position.y / 32)
					const chunkZ = Math.floor(position.z / 32)
					addSectionToQueue(chunkX, chunkY, chunkZ, player)
					soundbrick(
						{
							url: `1dN1jCFb8MXtsyLxa7Jfste2dagnHtpMT5GuyQSimHhuzoZFsszqXKPYPSAWR2kS9akYPBagpCJihtX56HKU2keNeqpWaPtgEwHK8GBz3kkUuD7iN1S7SfonL`, // [Required]
							sfxr: true,
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						},
						player
					)
					player.centerPrint(`${player.undoBuffer.undo.length}/25000`, 2)
				} else break
			}
		},
		applyRedo: async function (count) {
			const times = Math.min(Math.ceil(player.undoBuffer.redo.length / 3) + 1, 64)
			for (let i = 0; i < times; i++) {
				if (player.undoBuffer.redo.length) {
					const blockInfo = player.undoBuffer.redo[player.undoBuffer.redo.length - 1]
					const blockType = blockInfo[0]
					const blockData = blockInfo[1]
					const position = blockInfo[2]
					const oldBlockType = await voxelworld.getBlockType(position)
					const oldBlockData = await voxelworld.getBlockData(position)
					player.undoBuffer.undo.push([oldBlockType, oldBlockData, position])
					player.undoBuffer.redo.pop()
					await voxelworld.setBlockType(position, blockType)
					await voxelworld.setBlockData(position, blockData)
					const chunkX = Math.floor(position.x / 32)
					const chunkY = Math.floor(position.y / 32)
					const chunkZ = Math.floor(position.z / 32)
					addSectionToQueue(chunkX, chunkY, chunkZ, player)
					soundbrick(
						{
							url: `1dN1jCFb8MXtsyLxa7JfsteZKyXpDD3mwChBXWbJZuuX14mpaaRuXPLrAZA6CmqnR9cAejopjoSPAARYccfkZJkuZfdXPHCakdPy36GYcc86Y3KvxHrPsB32C`, // [Required]
							sfxr: true,
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						},
						player
					)
					player.centerPrint(`${player.undoBuffer.redo.length}`, 2)
				} else break
			}
		},
	}

	player.updateSelectionBox = function () {
		if (player.selectionPoint1.z == -10000 || player.selectionPoint2.z == -10000) return

		if (player.selectionPoint1.x < player.selectionPoint2.x) {
			var lx = player.selectionPoint1.x
			var hx = player.selectionPoint2.x
		} else {
			var lx = player.selectionPoint2.x
			var hx = player.selectionPoint1.x
		}

		if (player.selectionPoint1.y < player.selectionPoint2.y) {
			var ly = player.selectionPoint1.y
			var hy = player.selectionPoint2.y
		} else {
			var ly = player.selectionPoint2.y
			var hy = player.selectionPoint1.y
		}

		if (player.selectionPoint1.z < player.selectionPoint2.z) {
			var lz = player.selectionPoint1.z
			var hz = player.selectionPoint2.z
		} else {
			var lz = player.selectionPoint2.z
			var hz = player.selectionPoint1.z
		}

		console.log(-(lx - hx), -(ly - hy), -(lz - hz))
		console.log("========")

		const position = new Vector3(lx * 4, ly * 4, lz * 4)
		const scale = new Vector3(-(lx - hx - 1) * 4, -(ly - hy - 1) * 4, -(lz - hz - 1) * 4)
		console.log(scale)
		player.socketio.emit("bs", { netId: player.selectionBox.netId, x: scale.x, y: scale.y, z: scale.z })
		player.socketio.emit("bpos", { netId: player.selectionBox.netId, x: position.x, y: position.y, z: position.z })

		soundbrick(
			{
				url: "/sounds/ready.flac", // [Required]
				isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
			},
			player
		)
	}
	player.loadBricks([player.selectorBrick])
	player.loadBricks([player.selectorBrickMirrored])
	player.loadBricks([player.selectionBox])
	player.selectorBrick.setCollision(false)
	player.selectorBrickMirrored.setCollision(false)
	player.socketio.emit("bs", { netId: player.selectorBrick.netId, x: 4, y: 4, z: 4 }) // Removes collision
	player.socketio.emit("bs", { netId: player.selectorBrickMirrored.netId, x: 4, y: 4, z: 4 }) // Removes collision
	player.socketio.emit("bs", { netId: player.selectionBox.netId, x: 4, y: 4, z: 4 }) // Removes collision

	player.setInterval(async () => {
		player.plchunkx = Math.floor(player.position.x / 64)
		player.plchunky = Math.floor(player.position.y / 64)
		player.plchunkz = Math.floor(player.position.z / 64)

		//var chunkmeta = await getChunkMeta(player.plchunkx, player.plchunky)
		if (player.currentCreature.class === "builder") player.bottomPrint(`Player Position: \\c6${Math.floor(player.position.x / 4)} \\c5${Math.floor(player.position.y / 4)} \\c4${Math.floor(player.position.z / 4)} \\c0Chunk Position: \\c6${player.plchunkx} \\c5${player.plchunky} \\c4${player.plchunkz}`, 5)
	}, 275)

	var timeK = 0
	player.keypress(async (key) => {
		// input
		if (player.currentCreature.class !== "builder") return
		switch (
			key // TODO this
		) {
			case "z": // Undo
				if (player.currentCreature.class === "builder") {
					player.undoBuffer.applyUndo(1)
				}
				break
			case "y": // Redo
				if (player.currentCreature.class === "builder") {
					player.undoBuffer.applyRedo(1)
				}
				break
			case "!": // (Web) Selection point 1
				if (player.currentCreature.class === "builder") {
					player.selectionPoint1 = new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4))
					player.message(`Selection point 1 moved to \\c6X: ${player.selectionPoint1.x} \\c5Y: ${player.selectionPoint1.y} \\c4Z: ${player.selectionPoint1.z}`)
					player.updateSelectionBox()
				}
				break
			case "@": // (Web) Selection point 2
				if (player.currentCreature.class === "builder") {
					player.selectionPoint2 = new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4))
					player.message(`Selection point 2 moved to \\c6X: ${player.selectionPoint2.x} \\c5Y: ${player.selectionPoint2.y} \\c4Z: ${player.selectionPoint2.z}`)
					player.updateSelectionBox()
				}
				break
			case "#": // (Web) Clear selection points
				if (player.currentCreature.class === "builder") {
					player.selectionPoint1 = new Vector3(0, 0, -10000)
					player.selectionPoint2 = new Vector3(0, 0, -10000)
					player.centerPrint(`Selection points cleared`, 3)
					player.message(`Selection points cleared`)
					player.updateSelectionBox()
					player.socketio.emit("bs", { netId: player.selectionBox.netId, x: 0, y: 0, z: 0 })
				}
				break
			case "$": // (Web) Toggle symmetry modes
				if (player.currentCreature.class === "builder") {
					switch (player.symmetryEnabled) {
						case true:
							switch (player.symmetryAxis) {
								case "x":
									player.message(`Symmetry axis is set to \\c4Z`)
									player.symmetryAxis = "z"
									break
								case "z":
									player.message(`Symmetry disabled!`)
									player.symmetryAxis = "x"
									player.symmetryEnabled = false
									break
							}
							break
						case false:
							player.message(`Symmetry enabled! Symmetry axis is set to \\c6X`)
							player.symmetryEnabled = true
							player.symmetryOrigin = new Vector3(player.selectorBrick.position.x, player.selectorBrick.position.y, player.selectorBrick.position.z)
							break
					}
				}
				break
			default:
				break
		}
	})

	//render(0,0,4,player)
	//renderaround(player)

	player.rendering = false

	player.setInterval(async () => {
		if (player.rendering == false) {
			renderAround(player)
		}

		if (player.currentCreature.class !== "builder") {
			let block1 = await voxelworld.getBlockType(new Vector3(Math.floor(player.position.x / 4), Math.floor(player.position.y / 4), Math.floor(player.position.z / 4)))
			let block2 = await voxelworld.getBlockType(new Vector3(Math.floor(player.position.x / 4), Math.floor(player.position.y / 4), Math.floor(player.position.z / 4) + 1))
			let block3 = await voxelworld.getBlockData(new Vector3(Math.floor(player.position.x / 4), Math.floor(player.position.y / 4), Math.floor(player.position.z / 4) - 1))
			let block1Data = await voxelworld.getBlockData(new Vector3(Math.floor(player.position.x / 4), Math.floor(player.position.y / 4), Math.floor(player.position.z / 4)))
			let block2Data = await voxelworld.getBlockData(new Vector3(Math.floor(player.position.x / 4), Math.floor(player.position.y / 4), Math.floor(player.position.z / 4) + 1))
			let block1Col = !(block1 == 0 || block1Data == 1)
			let block2Col = !(block2 == 0 || block2Data == 1)

			if ((!block1Col && !block2Col) || player.position.z < 4) {
				// Strict
				player.lastVaildPosition = new Vector3(player.position.x, player.position.y, player.position.z)
			} else {
				if (!block1Col && block2Col) {
					// Step\
					player.setPosition(new Vector3(player.position.x, player.position.y, player.position.z + 4), false)
				} else {
					// push
					player.setPosition(new Vector3(Math.floor(player.lastVaildPosition.x / 4) * 4 + 2.5, Math.floor(player.lastVaildPosition.y / 4) * 4 + 2.5, player.lastVaildPosition.z), true)
				}
			}

			switch (block3) {
				case 2:
					if (player.currentCreature.saveID !== "magmeer") {
						player.setHealth(player.health - 0.1)
						soundbrick(
							{
								url: `12pD3tFhtN33JVvAbwbZyTyCXrwCzGv4SrY979EV1DBqwhuZdFqppU8hs2BcCt1rwM4rnY7PB55hE6JHeQ9nnzqZkPikp3Tp43PATT8fPSDYScMjcMrLhCpKAf`, // [Required]
								sfxr: true,
								isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
							},
							player
						)
					}
					break
				case 3:
					player.setHealth(player.health - 5)
					soundbrick(
						{
							url: `97AzDcJitE2DNxTEXq5a3FXGyNaSvwnAQ8sqRUgV1xFs5BGsHwWBBgTFCXHUoneGuQvqigFXJ6pd8CHiFU9Jtnh3gPCvecbN8BNvXRgSbsfuaVuJenBmkQtgw`, // [Required]
							sfxr: true,
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						},
						player
					)
					break
				case 4:
					player.setSpeed(1)
					player.changeStamina(-1)
					soundbrick(
						{
							url: `8fG5BqJ8QzGaTJunZaRv3Mo55kPhe6CFT4sjMcSp9YWRibAe5RUNQ7CimcoKiMUk93Y9wxEtifXVeo5Z489ru8EPrzvA4Qw7DdHgXrY3zLxq82ZSj5UH4RGYo`, // [Required]
							sfxr: true,
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						},
						player
					)
					break
				case 5:
					if (player.alive && player.currentCreature.class == "creature") {
						soundbrick({
							url: `/sounds/claws-hit.flac`,
							position: player.position,
							isGlobal: true,
							minDistance: 100,
							maxDistance: 20,
						})
						soundbrick({
							url: "7BMHBGP7k45pb8LrQ6DzRP156UzAYdDJ9WZwisGcTjxEtrie2hfJP1FEXXonz5v4mnBfbBqimtDHzuoSm6uw8MWybwFtJAunLmjXsqGF1RvmR1kW6diTiX47x", // [Required]
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
							sfxr: true,
							position: player.position,
							isGlobal: true,
							minDistance: 100,
							maxDistance: 20,
						})
						player.setHealth(0)
					}
					break
				default:
					break
			}
			player.boosterTime--
			if (player.boosterType !== "none") {
				if (player.boosterTime < 0) {
					player.setJumpPower(player.currentCreature)
					player.setSpeed(4)
					player.boosterType = "none"
				}
			}
		}
	}, 100)

	let markOnce = false
	player.updateBlockCursors = function updateBlockCursors() {
		// Update the block cursor. The block cursor's position is used for tools to operate on and is important to update it.
		if (player.currentCreature.class === "builder") {
			// Check if player is a builder creature
			// Cursor block position
			if (!markOnce) {
				markOnce = true
				player.socketio.emit("important", player.selectorBrick.netId)
			}
			const posX = Math.floor(player.position.x / 4) * 4
			const posY = Math.floor(player.position.y / 4) * 4
			const posZ = Math.floor(player.position.z / 4) * 4

			const newPos = new Vector3(posX, posY, posZ)
			const me = player.selectorBrick.position
			if ((me.x === newPos.x && me.y === newPos.y && me.z === newPos.z) == false) {
				player.selectorBrick.position = newPos
				player.socketio.emit("bpos", { netId: player.selectorBrick.netId, x: player.selectorBrick.position.x, y: player.selectorBrick.position.y, z: player.selectorBrick.position.z }) // Move brick packet
			}

			// If symmetry is enabled, move the mirror cursor
			if (player.symmetryEnabled === true) {
				if (player.symmetryAxis === "x") {
					player.selectorBrickMirrored.setPosition(new Vector3(player.symmetryOrigin.x - (player.selectorBrick.position.x - player.symmetryOrigin.x), player.selectorBrick.position.y, player.selectorBrick.position.z))
				} else {
					// z
					player.selectorBrickMirrored.setPosition(new Vector3(player.selectorBrick.position.x, player.symmetryOrigin.y - (player.selectorBrick.position.y - player.symmetryOrigin.y), player.selectorBrick.position.z))
				}
				player.socketio.emit("bpos", { netId: player.selectorBrickMirrored.netId, x: player.selectorBrickMirrored.position.x, y: player.selectorBrickMirrored.position.y, z: player.selectorBrickMirrored.position.z })
			}
		}
	}

	player.setInterval(() => {
		// Main loop of block placement overlay (selectorBrick) and important for where blocks will be placed
		player.updateBlockCursors()
	}, 90)

	player.setInterval(async () => {
		unloadSections(player)
	}, 10000)
})

Game.command("colorhex", (p, msg) => {
	msg = hexToRgb(msg)
	if (msg === null) return p.message("\\c6Must be a hex code!")
	// colorCompl = hexToRgb("#000001")
	var colorComp = 1000
	var topColor = 0

	var mName = "None"
	var mHexC = "#000001"
	colorbyid.forEach((element) => {
		let value = deltaE(msg, hexToRgb(element.hexString))
		//console.log(value)
		if (value < colorComp) {
			if (element.colorId != 0) {
				colorComp = value
				topColor = element.colorId
				mName = element.name
				mHexC = element.hexString
			}
		}
	})
	p.selectedColor = topColor
	p.message(`New color is [${mHexC}]${mName}`)
})

Game.command("viewdistance", (p, msg) => {
	switch (msg) {
		case "1":
			p.viewDistanceN = -1
			p.viewDistanceP = 2
			p.message("\\c5View distanced toggled to 3x3x3")
			break
		case "2":
			p.viewDistanceN = -2
			p.viewDistanceP = 3
			p.message("\\c5View distanced toggled to 5x5x5")
			break
		case "3":
			p.viewDistanceN = -3
			p.viewDistanceP = 4
			p.message("\\c5View distanced toggled to 7x7x7")
			break
		case "4":
			p.viewDistanceN = -4
			p.viewDistanceP = 5
			p.message("\\c5View distanced toggled to 9x9x9")
			break
		case "5":
			p.viewDistanceN = -5
			p.viewDistanceP = 6
			p.message("\\c5View distanced toggled to 11x11x11")
			break
		case "6":
			p.viewDistanceN = -6
			p.viewDistanceP = 7
			p.message("\\c5View distanced toggled to 13x13x13")
			break
		case "7":
			p.viewDistanceN = -7
			p.viewDistanceP = 8
			p.message("\\c5View distanced toggled to 15x15x15")
			break
		case "8":
			p.viewDistanceN = -8
			p.viewDistanceP = 9
			p.message("\\c5View distanced toggled to 17x17x17")
			break
		case "screenshot":
			p.viewDistanceN = -15
			p.viewDistanceP = 16
			break
		default:
			p.message("Params are: 1 = Lowest | 2 | 3 | 5 = Far | 5 | 6 | 7 | 8 = Extreme")
			break
	}
})
meshMode = true
Game.command("fast", async (p, msg) => {
	meshMode = false
	p.message("Fast meshing enabled")
})
Game.command("slow", async (p, msg) => {
	meshMode = true
	p.message("Slow meshing enabled")
})

Game.command("spawn", async (p, msg) => {
	p.setPosition(new Vector3(0, 0, 300))
	p.lastVaildPosition = p.position
})

Game.command("rtp", async (p, msg) => {
	p.message("Teleported!")
	p.setPosition(new Vector3(randomIntFromInterval(-3500, 3500), randomIntFromInterval(-3500, 3500), 500))
	p.lastVaildPosition = p.position
	soundbrick(
		{
			url: "/sounds/roll.mp3", // [Required]
			isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
		},
		p
	)
})
const spiral = require("spiralloop")

async function renderAround(player) {
	if (player.lastChunk.x !== Math.floor(player.plchunkx / 2) || player.lastChunk.y !== Math.floor(player.plchunky / 2) || Math.floor(player.lastChunk.z / 2) !== player.plchunkz) {
		player.lastChunk = new Vector3(Math.floor(player.plchunkx / 2), Math.floor(player.plchunky / 2), Math.floor(player.plchunkz / 2))
		const renderSectionPos = new Vector3(Math.floor(player.plchunkx / 2), Math.floor(player.plchunky / 2), Math.floor(player.plchunkz / 2))
		player.rendering = true
		let clusters = []
		if (player.viewDistanceN < -3) {
			var verticalSectionN = -3
		} else var verticalSectionN = player.viewDistanceN
		if (player.viewDistanceP > 4) {
			var verticalSectionP = 4
		} else var verticalSectionP = player.viewDistanceP

		const loopCols = []
		spiral([-player.viewDistanceN + player.viewDistanceP, -player.viewDistanceN + player.viewDistanceP], function (x, y) {
			loopCols.push([x, y])
		})

		for (let i = 0; i < loopCols.length; i++) {
			const x = loopCols[i][0] + player.viewDistanceN
			const y = loopCols[i][1] + player.viewDistanceN
			for (var z = verticalSectionN; z < verticalSectionP; z++) {
				let cluster = await render(renderSectionPos.x + x, renderSectionPos.y + y, renderSectionPos.z + z, player, false)
				if (cluster) clusters.push(cluster)
			}
		}

		clusters = clusterSerialize(clusters)
		if (clusters) player.socketio.emit("t", clusters)
		player.rendering = false
	}
}

// example : x,y,z,x,y,z,x,y,z,ff0000,x,y,z,x,y,z,ff0000,x,y,z,x,y,z,ff0000,x,y,z,x,y,z,ff0000\x,y,z,x,y,z,x,y,z,ff0000
clusterSerialize = function (clusters) {
	let str = ""
	clusters.forEach((cluster) => {
		if (str) str = str + "/" // Cluster divider
		str = str + cluster.position.x
		str = str + "," // Cluster divider
		str = str + cluster.position.y
		str = str + "," // Cluster divider
		str = str + cluster.position.z
		str = str + "," // Cluster divider
		cluster.b.forEach((brick) => {
			try {
				str = str + mdd(brick.position.x).toString(36)
				str = str + mdd(brick.position.y).toString(36)
				str = str + mdd(brick.position.z).toString(36)
				str = str + mdd(brick.scale.x, true).toString(36)
				str = str + mdd(brick.scale.y, true).toString(36)
				str = str + mdd(brick.scale.z, true).toString(36)
				str = str + serializeBool(brick.collision) // Collision
				str = str + brick.color.substr(1, 6)
				//console.log(encode, encode26.decode(encode))
			} catch (e) {
				console.log(e)
			}
		})
	})
	return str
}

serializeBool = function (bol) {
	if (bol) return "1"
	return "0"
}

mdd = function (n, s) {
	// Moudlus debangler detraction (Why?)
	n = n / 4
	n = n % 32
	if (n < 0) {
		n = -n
		n = -((n - 32) % 32)
	}
	if (s === true && n === 0) n = 32
	return n
}

let chunkQueue = []

async function addSectionToQueue(cx, cy, cz, player) {
	if (chunkQueue.some((i) => i.x == cx && i.y == cy && i.z == cz) == false) {
		chunkQueue.push({ x: cx, y: cy, z: cz, player: player })
	}
}

async function startRegularIntervals() {
	setInterval(() => {
		var sections = chunkQueue
		chunkQueue = []
		sections.forEach((element) => {
			render(element.x, element.y, element.z, element.player, true)
		})
	}, 300)

	function postBlocks() {
		if (blockLogAdd || blockLogRemove) {
			blockLogRemove = 0
			blockLogAdd = 0
		}
	}

	if (Game.serverSettings.sepraType === "regular") {
		Game.command("post", (caller, args) => {
			postBlocks()
		})

		setInterval(() => {
			// Block log channel
			postBlocks()
		}, 1800000)
	}

	setInterval(() => {
		var keys = Object.keys(saveQueue.chunkData)
		if (keys.length > 0) {
			keys.forEach((element) => {
				if (dataCache.chunkData[element] !== undefined) {
					fs.writeFile(`./voxelStorage/${Game.serverSettings.sepraType}/savedata/chunkmeta/${element}.json`, JSON.stringify(dataCache.chunkData[element]), function (err) {
						if (err) throw err
						console.log(`Saved ${element}.json chunk meta`)
					})
				} else {
					console.error(`Attempted to write undefined in chunk data region ${element}.json`)
					soundbrick({
						url: "/sounds/random/criterror.mp3", // [Required]
						isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
					})
				}
			})
			saveQueue.chunkData = {}
		}

		var keys = Object.keys(saveQueue.playerData)
		if (keys.length > 0) {
			// This is where player data WOUlD'VE saved, but sepragane doesnt need that for now.
			saveQueue.playerData = {}
		}

		var keys = Object.keys(saveQueue.cacheData)
		if (keys.length > 0) {
			keys.forEach((element) => {
				if (dataCache.cacheData[element] !== undefined) {
					fs.writeFile(`./voxelStorage/${Game.serverSettings.sepraType}/cache/${element}.json`, JSON.stringify(dataCache.cacheData[element]), function (err) {
						if (err) throw err
						console.log(`Saved ${element}.json cache region`)
					})
				} else {
					console.error(`Attempted to write undefined in chunk cache ${element}.json`)
					soundbrick({
						url: "/sounds/random/criterror.mp3", // [Required]
						isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
					})
				}
			})
			saveQueue.cacheData = {}
		}

		if (saveQueue.saveGlobal == true) {
			fs.writeFile(`./voxelStorage/${Game.serverSettings.sepraType}/savedata/global.json`, JSON.stringify(globalData), function (err) {
				if (err) throw err
				console.log(`Saved global game data`)
			})
			saveQueue.saveGlobal = false
		}
	}, 30000)
}

startRegularIntervals()

function unloadSections(player) {
	const renderChunkPos = new Vector3(Math.floor(player.plchunkx / 2), Math.floor(player.plchunky / 2), Math.floor(player.plchunkz / 2))
	if (player.viewDistanceN < -3) {
		var verticalSectionN = -3
	} else var verticalSectionN = player.viewDistanceN
	if (player.viewDistanceP > 4) {
		var verticalSectionP = 4
	} else var verticalSectionP = player.viewDistanceP

	player.loadedchunks
		.filter((section) => section.x > player.viewDistanceP + renderChunkPos.x - 1 || section.x < player.viewDistanceN + renderChunkPos.x || section.z > verticalSectionP + renderChunkPos.z - 1 || section.z < verticalSectionN + renderChunkPos.z || section.y > player.viewDistanceP + renderChunkPos.y - 1 || section.y < player.viewDistanceN + renderChunkPos.y)
		.forEach((toDelete) => {
			player.socketio.emit("dt", `${toDelete.x} ${toDelete.y} ${toDelete.z}`)
			player.loadedchunks.splice(player.loadedchunks.indexOf(toDelete), 1)
		})
}

async function placeblock(blockPos, blockType, player, soundEnabled, showGhostBlock, useSymmetry) {
	const chunkX = Math.floor(blockPos.x / 32)
	const chunkY = Math.floor(blockPos.y / 32)
	const chunkZ = Math.floor(blockPos.z / 32)
	const originalBlockType = await voxelworld.getBlockType(blockPos)
	const originalBlockData = await voxelworld.getBlockData(blockPos)
	let placedBlockData = player.blockData
	if (blockType === 0) placedBlockData = 0
	//console.log(chunkx,chunkz)
	//var chunkMeta = await getChunkMeta(chunkx, chunky) // May come handy later

	let playInvaild = true
	if (soundEnabled === "noInvaild") {
		soundEnabled = true
		playInvaild = false
	}
	if (soundEnabled && playInvaild) {
		if (originalBlockType == blockType && placedBlockData == originalBlockData)
			soundbrick(
				{
					url: `11111GvZH7jwT4FjsvL4Kt7D9TBj81nTkcvBs3VbcAfsTdCKdtFu6AmMN5iKGM55Y4cPxiz6SG7etbWKP2QkiVwBfo54smV8s9t7v37V7MT1vDs7CEjwSjSf`, // [Required]
					sfxr: true,
					isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
				},
				player
			)
	}
	if (originalBlockType == blockType && placedBlockData == originalBlockData) return

	//console.log(chunkx, chunky, chunkz)
	if (soundEnabled) {
		if (blockType == 0) {
			soundbrick(
				{
					url: `1tGxwj1Ux1oBiUN2ozTJbiuCyaQNPJyhJXPqkxrUkSabLx1ZQZntoD4SWbY257rbbJa1tREesTjMR4xz5C84HjMhJkoNkH5V4FEhGvaQRYDWc4vnwrnGJy5Aq`, // [Required]
					sfxr: true,
					isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
				},
				player
			)
		} else {
			switch (placedBlockData) {
				case 1:
					soundbrick(
						{
							url: "/sounds/build-glass.mp3", // [Required]
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						},
						player
					)
					break
				case 2:
					soundbrick(
						{
							url: "/sounds/fire-projectile.mp3", // [Required]
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						},
						player
					)
					break
				case 3:
					soundbrick(
						{
							url: "/sounds/fire-spew.mp3", // [Required]
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						},
						player
					)
					break
				case 4:
					soundbrick(
						{
							url: "7BMHBGP7k45pb8LrQ6DzRP156UzAYdDJ9WZwisGcTjxEtrie2hfJP1FEXXonz5v4mnBfbBqimtDHzuoSm6uw8MWybwFtJAunLmjXsqGF1RvmR1kW6diTiX47x", // [Required]
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
							sfxr: true,
						},
						player
					)
					break
				case 5:
					soundbrick(
						{
							url: "7BMHBGP7k45pb8LrQ6DzRP156UzAYdDJ9WZwisGcTjxEtrie2hfJP1FEXXonz5v4mnBfbBqimtDHzuoSm6uw8MWybwFtJAunLmjXsqGF1RvmR1kW6diTiX47x", // [Required]
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
							sfxr: true,
						},
						player
					)
					break
				default:
					soundbrick(
						{
							url: `12DKJfT59AXDmFaGRUZeaJCXCQ5n5m3LiydpWR7aP9yiv2BZ3zMA1YsDp7rNgQAqSz2KBiuzosdSMdJdTH7wYYVLDx9GYMtS8PVxezFxUUx1RgkFAyAxizGUYa`, // [Required]
							sfxr: true,
							isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
						},
						player
					)
					break
			}
		}
	}

	await voxelworld.setBlockType(blockPos, blockType)
	await voxelworld.setBlockData(blockPos, placedBlockData)
	player.undoBuffer.add(originalBlockType, originalBlockData, blockPos)

	addSectionToQueue(chunkX, chunkY, chunkZ, player)
	if (showGhostBlock === undefined) showGhostBlock = true
	if (showGhostBlock === true) {
		// Ghostly blocks
		var falsebrick = new Brick(new Vector3(blockPos.x * 4, blockPos.y * 4, blockPos.z * 4), new Vector3(4, 4, 4), colorbyid[blockType].hexString)

		player.loadBricks([falsebrick])
		setTimeout(() => {
			player.deleteBricksWeb([falsebrick])
		}, 400)
		if (!useSymmetry && player.symmetryEnabled) {
			if (player.symmetryAxis === "x") placeblock(new Vector3(player.symmetryOrigin.x / 4 - (blockPos.x - player.symmetryOrigin.x / 4), blockPos.y, blockPos.z), blockType, player, true, true, true)

			if (player.symmetryAxis === "z") placeblock(new Vector3(blockPos.x, blockPos.y, player.symmetryOrigin.y / 4 - (blockPos.z - player.symmetryOrigin.y / 4)), blockType, player, true, true, true)
		}
	}

	globalData.globalBlocksAdded++
	var data = await getPlayerData(player.userId)
	if (blockType !== 0) {
		data.stats.totalBlocksPlaced++
		blockLogAdd++
	} else {
		data.stats.totalBlocksRemoved++
		blockLogRemove++
	}
	if (data.stats.totalBlocksPlacedByColorID[`${blockType}`] == undefined) {
		data.stats.totalBlocksPlacedByColorID[`${blockType}`] = 0
	}

	data.stats.totalBlocksPlacedByColorID[`${blockType}`]++

	saveQueue.saveGlobal = true

	saveQueue.playerData[`${player.userId}`] = true

	globalData.mapRenderQueue[`${chunkX} ${chunkY}`] = { x: chunkX, y: chunkY }
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}

async function pickcolor(blockPos, player) {
	// pickblock, pick block
	var newColor = await voxelworld.getBlockType(blockPos)
	if (newColor == 0) {
		soundbrick(
			{
				url: `11111GvZH7jwT4FjsvL4Kt7D9TBj81nTkcvBs3VbcAfsTdCKdtFu6AmMN5iKGM55Y4cPxiz6SG7etbWKP2QkiVwBfo54smV8s9t7v37V7MT1vDs7CEjwSjSf`, // [Required]
				sfxr: true,
				isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
			},
			player
		)
	} else {
		player.selectedColor = newColor
		player.message(`New color is [${colorbyid[newColor].hexString}]${colorbyid[newColor].name} \\c0[ID: ${newColor}]`)
		soundbrick(
			{
				url: "/sounds/tonecraft/sample/corny/10.ogg", // [Required]
				isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
			},
			player
		)
	}
}

Game.command("c", (p, msg) => {
	p.message("")
	p.message("")
	p.message("")
	p.message("")
	p.message("")
	p.message("")
	p.message("")
	p.message("")
	p.message("")
	p.message("")
})

Game.command("models", (p, msg) => {
	p.setPosition(new Vector3(-2029, -1666, 285))
})

function chunkMetaUpdate(data) {
	// Current version: 2
	//var oldDataVersion = data.dataVersion

	if (data.dataVersion == 1) {
		data.dataVersion = 2
	}
	if (data.dataVersion == 2) {
		data.dataVersion = 3
		data.objects = []
		data.waterLevel = 0
		data.waterEnabled = false
		data.waterColor = 5
		data.drownType = true
	}

	return data
}

function playerDataUpdate(data) {
	// Current version: 2

	const oldDataVersion = data.dataVersion

	if (data.dataVersion == 1) {
		data.dataVersion = 2

		let t = new Date()
		t.setDate(t.getDate() + 1)
		t.setHours(0)
		t.setMinutes(0)
		t.setSeconds(0)
		t.setMilliseconds(0)

		data.dailyRewardDate = t.getTime()

		//data.gemSpawnLastChecked = new Date()
	}

	return data
}

function getChunkMeta(x, y) {
	if (dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`] !== undefined) {
		// Is the region in memory?
		if (dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`][`${x} ${y}`] !== undefined) {
			// Region exists but does the chunk exist?
			let chunk = dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`][`${x} ${y}`]
			if (chunk.dataVersion !== 3) {
				// Update if outdated
				chunk = chunkMetaUpdate(chunk)
				saveQueue.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`] = true // Add region to saving queue
				console.log(`Updated chunk meta ${x} ${y}.json from dataVersion 1 to 2`)
			}
			return dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`][`${x} ${y}`]
		} else {
			let chunk = createChunkMeta(x, y)
			dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`][`${x} ${y}`] = chunk
			saveQueue.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`] = true // Add region to saving queue
			return chunk
		}
	} else {
		// Region wasn't in memory. Read from disk
		try {
			if (fs.existsSync(`./voxelStorage/${Game.serverSettings.sepraType}/savedata/chunkmeta/${Math.floor(x / 32)} ${Math.floor(y / 32)}.json`) == true) {
				let region = JSON.parse(fs.readFileSync(`./voxelStorage/${Game.serverSettings.sepraType}/savedata/chunkmeta/${Math.floor(x / 32)} ${Math.floor(y / 32)}.json`).toString()) // Read region from disk
				dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`] = region
				if (region[`${x} ${y}`] !== undefined) {
					// Does chunk exists in region?
					var chunk = region[`${x} ${y}`]
					if (chunk.dataVersion !== 3) {
						// Update if outdated
						chunk = chunkMetaUpdate(chunk)
						saveQueue.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`] = true // Add region to saving queue
						console.log(`Updated chunk meta ${x} ${y}.json from dataVersion 1 to 2`)
					}
				} else {
					var chunk = createChunkMeta(x, y)
					dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`][`${x} ${y}`] = chunk
				}

				return chunk
			} else {
				// The region didn't exist in disk
				let chunk = createChunkMeta(x, y)
				dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`] = {}
				dataCache.chunkData[`${Math.floor(x / 32)} ${Math.floor(y / 32)}`][`${x} ${y}`] = chunk
				return chunk
			}
		} catch (error) {
			Game.messageAll(`\\c6Error while loading chunk meta at region ${Math.floor(x / 16)} ${Math.floor(y / 16)}, chunk ${x} ${y}.`)
			console.log("Error while loading chunk meta!")
			console.error(error)
			return { error: true }
		}
	}
	// ...
}

async function getPlayerData(id) {
	if (dataCache.playerData[`${id}`] !== undefined) {
		return dataCache.playerData[`${id}`]
	} else {
		try {
			if (fs.existsSync(`./voxelStorage/${Game.serverSettings.sepraType}/savedata/players/${id}.json`) == true) {
				var json = fs.readFileSync(`./voxelStorage/${Game.serverSettings.sepraType}/savedata/players/${id}.json`).toString()
				var data = JSON.parse(json)
				if (data.dataVersion !== 2) {
					data = playerDataUpdate(data)
					console.log(`Player dataversion updated!`)
				}
				dataCache.playerData[`${id}`] = data
				return data
			} else {
				var data = await createPlayerData(id)
				dataCache.playerData[`${id}`] = data
				return data
			}
		} catch (error) {
			console.log("error while loading player data")
			console.error(error)
			return { error: true }
		}
	}
}

Game.command("pos", (p, msg) => {
	console.log(`${Math.round(p.position.x)} ${Math.round(p.position.y)} ${Math.round(p.position.z)}`)
})

async function replaceBlocksInSelection(player, blockType, settings = { type: "default" }) {
	if (player.selectionPoint1.x < player.selectionPoint2.x) {
		var lx = player.selectionPoint1.x
		var hx = player.selectionPoint2.x
	} else {
		var lx = player.selectionPoint2.x
		var hx = player.selectionPoint1.x
	}

	if (player.selectionPoint1.y < player.selectionPoint2.y) {
		var ly = player.selectionPoint1.y
		var hy = player.selectionPoint2.y
	} else {
		var ly = player.selectionPoint2.y
		var hy = player.selectionPoint1.y
	}

	if (player.selectionPoint1.z < player.selectionPoint2.z) {
		var lz = player.selectionPoint1.z
		var hz = player.selectionPoint2.z
	} else {
		var lz = player.selectionPoint2.z
		var hz = player.selectionPoint1.z
	}

	switch (settings.type) {
		case "noise":
			if (settings.avoidAir) {
				for (var y = ly; y < hy + 1; y++) {
					for (var z = lz; z < hz + 1; z++) {
						for (var x = lx; x < hx + 1; x++) {
							if (Math.random() < settings.amount) {
								let block = await voxelworld.getBlockType(new Vector3(x, y, z))
								if (block) await placeblock(new Vector3(x, y, z), blockType, player, false, false)
							}
						}
					}
				}
			} else {
				for (var y = ly; y < hy + 1; y++) {
					for (var z = lz; z < hz + 1; z++) {
						for (var x = lx; x < hx + 1; x++) {
							if (Math.random() < settings.amount) await placeblock(new Vector3(x, y, z), blockType, player, false, false)
						}
					}
				}
			}
			break
		case "place":
			for (var y = ly; y < hy + 1; y++) {
				for (var z = lz; z < hz + 1; z++) {
					for (var x = lx; x < hx + 1; x++) {
						let place = true
						if (settings.replaceOnlyAir) {
							let block = await voxelworld.getBlockType(new Vector3(x, y, z))
							if (block != 0) place = false
						}
						if (place) await placeblock(new Vector3(x, y, z), blockType, player, false, false)
					}
				}
			}
			break
		default:
			for (var y = ly; y < hy + 1; y++) {
				for (var z = lz; z < hz + 1; z++) {
					for (var x = lx; x < hx + 1; x++) {
						await placeblock(new Vector3(x, y, z), blockType, player, false, false)
					}
				}
			}
			break
	}
}

async function saveBlocksInSelectionToFile(player) {
	try {
		if (player.selectionPoint1.x < player.selectionPoint2.x) {
			var lx = player.selectionPoint1.x
			var hx = player.selectionPoint2.x
		} else {
			var lx = player.selectionPoint2.x
			var hx = player.selectionPoint1.x
		}

		if (player.selectionPoint1.y < player.selectionPoint2.y) {
			var ly = player.selectionPoint1.y
			var hy = player.selectionPoint2.y
		} else {
			var ly = player.selectionPoint2.y
			var hy = player.selectionPoint1.y
		}

		if (player.selectionPoint1.z < player.selectionPoint2.z) {
			var lz = player.selectionPoint1.z
			var hz = player.selectionPoint2.z
		} else {
			var lz = player.selectionPoint2.z
			var hz = player.selectionPoint1.z
		}

		const palette = []
		colorbyid.forEach((element, index) => {
			if (index !== 0) palette.push([element.rgb.r, element.rgb.g, element.rgb.b])
		})
		palette.push([0, 0, 0]) // air

		const { VoxelModelWriter } = require("chunked-vox")
		const largeVoxelModel = new VoxelModelWriter(palette)
		for (var y = ly; y < hy + 1; y++) {
			for (var z = lz; z < hz + 1; z++) {
				for (var x = lx; x < hx + 1; x++) {
					block = await voxelworld.getBlockType(new Vector3(x, y, z))
					if (block !== 0) {
						// Is block air?
						largeVoxelModel.setBlock(-(lx - x), -(ly - y), -(lz - z), block)
					}
				}
			}
		}
		// Save as file
		let filename = getRandomFileString()
		fs.writeFileSync(`./voxels/${filename}.vox`, largeVoxelModel.writeVox(true))
		player.message(`Saved as \\c6${filename}.vox`)
		soundbrick(
			{
				url: "/sounds/random/takephoto.mp3", // [Required]
				isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
			},
			player
		)
	} catch (error) {
		player.message("An error occurred when exporting to .vox")
		console.log(error)
	}
}

function getRandomFileString() {
	return [...Array(30)].map((i) => (~~(Math.random() * 36)).toString(36)).join("")
}
var placeDebug = require("../vtools/placeDebug").use

Game.command("loadmesh", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		if (msg.length === 30) {
			try {
				if (player.loadedPrefab) {
					player.loadedPrefab = null // It's async, let's be safe
					player.deleteBricksWeb(player.loadedPrefabBricks) // Delete bricks
				}
				player.loadedPrefab = new VoxReader(fs.readFileSync(`./voxels/${msg}.vox`)) // FIXME: It is important to clean input!
				player.loadedPrefabBricks = await brickMesher(player.loadedPrefab)
				player.loadedPrefabPosition = new Vector3(player.selectorBrick.position.x / 4, player.selectorBrick.position.y / 4, player.selectorBrick.position.z / 4)
				player.loadedPrefabBricks.forEach((brick) => {
					brick.position.x += player.selectorBrick.position.x
					brick.position.y += player.selectorBrick.position.y
					brick.position.z += player.selectorBrick.position.z
				})
				player.loadBricks(player.loadedPrefabBricks)
			} catch (error) {
				player.message("Error while loading")
				console.log(error)
			}
		} else {
			switch (msg) {
				case "move":
					if (player.loadedPrefab) {
						player.loadedPrefabPosition = new Vector3(player.selectorBrick.position.x / 4, player.selectorBrick.position.y / 4, player.selectorBrick.position.z / 4) // Set position for paste command
						player.deleteBricksWeb(player.loadedPrefabBricks) // Delete bricks

						// Reload prefab bricks
						player.loadedPrefabBricks = await brickMesher(player.loadedPrefab)
						player.loadedPrefabBricks.forEach((brick) => {
							brick.position.x += player.selectorBrick.position.x
							brick.position.y += player.selectorBrick.position.y
							brick.position.z += player.selectorBrick.position.z
						})
						player.loadBricks(player.loadedPrefabBricks)
					} else {
						player.message("You don't have a prefab loaded!")
						player.message(`/prefab (Prefab ID) \\c2Loads up a prefab by ID and previews the model in the world. ex: /prefab e6bxoet6zl9p7mx03wd774y7vhck3l`)
					}
					break
				case "paste":
					if (player.loadedPrefab) {
						const reader = player.loadedPrefab
						for (var y = 0; y < player.loadedPrefab.h + 1; y++) {
							for (var z = 0; z < player.loadedPrefab.d + 1; z++) {
								for (var x = 0; x < player.loadedPrefab.w + 1; x++) {
									const blockType = await reader.getBlockType(new Vector3(x, y, z))
									if (blockType !== 0) await placeblock(new Vector3(x + player.loadedPrefabPosition.x, y + player.loadedPrefabPosition.y, z + player.loadedPrefabPosition.z), blockType, player, false, false)
								}
							}
						}
						player.message("Pasted!")
					}
					break

				default:
					player.message(`/prefab (Prefab ID) \\c2Loads up a prefab by ID and previews the model in the world. ex: /prefab e6bxoet6zl9p7mx03wd774y7vhck3l`)
					player.message(`/prefab move \\c2Move the prefab preview to the block cursor`)
					player.message(`/prefab paste \\c2Pastes all blocks in preview into the world, finalizing all changes.`)
					player.message(`/prefab cancel \\c2Remove previews and cleans pasting, canceling all changes.`)
					break
			}
		}
	}
})

Game.command("type", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		switch (msg) {
			case "basic":
				player.blockData = 0
				player.message(`Block type switched to basic`)
				break
			case "magma":
				player.blockData = 2
				player.message(`Block type switched to magma`)
				break
			case "lava":
				player.blockData = 3
				player.message(`Block type switched to lava`)
				break
			case "mud":
				player.blockData = 4
				player.message(`Block type switched to mud`)
				break
			case "impale":
				player.blockData = 5
				player.message(`Block type switched to impale`)
				break
			case "ghost":
				player.blockData = 1
				player.message(`Block type switched to ghost`)
				break

			default:
				player.message(`/type basic \\c2Normal regular block that does nothing.`)
				player.message(`/type magma \\c2If stood on, the player will take 1 damage per second`)
				player.message(`/type lava \\c2If stood on, the player will take 50 damage per second`)
				player.message(`/type mud \\c2`)
				player.message(`/type impale \\c2Instant death`)
				player.message(`/type ghost \\c2Makes a block have no collision.`)
				player.message(`/type juicer \\c2(wip) Alternative to the juicer world object. Plauers slowly get juiced from standing and attract more danger to them.`)
				break
		}
	}
})

function funnyBoolean(str) {
	const yes = ["yes", "yay", "true", "1", "ye", "y"]
	const no = ["no", "nay", "false", "0", "n"]
	if (yes.includes(str)) return true
	if (no.includes(str)) return false
	return null
}

Game.command("selection", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		if (player.selectionPoint1.z == -10000 || player.selectionPoint2.z == -10000) return player.message("Selection not found")
		if (player.selectionPoint1.x < player.selectionPoint2.x) {
			var lx = player.selectionPoint1.x
			var hx = player.selectionPoint2.x
		} else {
			var lx = player.selectionPoint2.x
			var hx = player.selectionPoint1.x
		}

		if (player.selectionPoint1.y < player.selectionPoint2.y) {
			var ly = player.selectionPoint1.y
			var hy = player.selectionPoint2.y
		} else {
			var ly = player.selectionPoint2.y
			var hy = player.selectionPoint1.y
		}

		if (player.selectionPoint1.z < player.selectionPoint2.z) {
			var lz = player.selectionPoint1.z
			var hz = player.selectionPoint2.z
		} else {
			var lz = player.selectionPoint2.z
			var hz = player.selectionPoint1.z
		}

		console.log(-(lx - hx), -(ly - hy), -(lz - hz))
		if (-(lx - hx) > 512 || -(ly - hy) > 512 || -(lz - hz) > 512) return player.message("That's too big!")

		msg = msg.split(" ")
		switch (msg[0]) {
			case "place":
				replaceBlocksInSelection(player, player.selectedColor, {
					type: "place",
					replaceOnlyAir: funnyBoolean(msg[1]) ?? false,
				})
				break
			case "noise":
				replaceBlocksInSelection(player, player.selectedColor, {
					type: "noise",
					amount: msg[1] ?? 0.5,
					avoidAir: funnyBoolean(msg[2]) ?? true,
				})
				break
			case "remove":
				replaceBlocksInSelection(player, 0)
				break
			case "save":
				saveBlocksInSelectionToFile(player)
				break

			default:
				player.message(`Selection's size: \\c6X: \\c0${-(lx - hx - 1)} \\c5Y: \\c0${-(ly - hy - 1)} \\c4Z: \\c0${-(lz - hz - 1)}`)
				player.message(`Blocks in selection: ${-(lx - hx - 1) * -(ly - hy - 1) * -(lz - hz - 1)}`)
				player.message(`Use \\c2/selection place [replaceOnlyAir : (false-true). default: false] \\c0to place blocks inside the selection with your current picked color`)
				player.message(`Use \\c2/selection noise [amount : (0-1). default: 0.5] [avoidAir : (false-true). default: true] \\c0Functions like selection place, but affected by noise. If avoidAir is true, blocks will not be added to empty blocks.`)
				player.message(`Use \\c2/selection remove \\c0to remove blocks inside the selection`)
				player.message(`Use \\c2/selection save \\c0to save blocks inside the selection as a .vox file`)
				break
		}
	}
})

Game.command("enabletimetrial", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		if (player.referingWorldObject) {
			const meta = await voxelWorld.getChunkMeta(player.referingWorldObjectPosition.x, player.referingWorldObjectPosition.y)
			const trial = meta.objects.find((obj) => obj.id === player.referingWorldObject)
			if (trial.objectName == "timetrial") {
				trial.endPosition = { x: player.position.x, y: player.position.y, z: player.position.z }
				trial.enabled = !trial.enabled
				saveQueue.chunkData[`${Math.floor(player.referingWorldObjectPosition.x / 32)} ${Math.floor(player.referingWorldObjectPosition.y / 32)}`] = true

				player.message(`Trial state set! ID: ${player.referingWorldObject} at chunk: ${player.referingWorldObjectPosition.x} ${player.referingWorldObjectPosition.y}`)
				soundbrick(
					{
						url: "/sounds/random/TMPmajor.ogg", // [Required]
						isGlobal: true,
					},
					player
				)
			} else {
				player.message("This object isn't a time trial!")
			}
		} else {
			player.message("There wasn't a referenced time trial beforehand!")
		}
	}
})

Game.command("nameobject", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		if (player.referingWorldObject) {
			const meta = await voxelWorld.getChunkMeta(player.referingWorldObjectPosition.x, player.referingWorldObjectPosition.y)
			const worldObject = meta.objects.find((obj) => obj.id === player.referingWorldObject)
			worldObject.name = msg
			saveQueue.chunkData[`${Math.floor(player.referingWorldObjectPosition.x / 32)} ${Math.floor(player.referingWorldObjectPosition.y / 32)}`] = true

			player.message(`Object name set! ID: ${player.referingWorldObject} at chunk: ${player.referingWorldObjectPosition.x} ${player.referingWorldObjectPosition.y}`)
			soundbrick(
				{
					url: "/sounds/random/TMPmajor.ogg", // [Required]
					isGlobal: true,
				},
				player
			)
		} else {
			player.message("There wasn't a referenced world object beforehand!")
		}
	}
})

Game.command("addcheckpoint", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		if (player.referingWorldObject) {
			const meta = await voxelWorld.getChunkMeta(player.referingWorldObjectPosition.x, player.referingWorldObjectPosition.y)
			const trial = meta.objects.find((obj) => obj.id === player.referingWorldObject)
			if (trial.objectName == "timetrial") {
				trial.checkpoints.push({ x: player.position.x, y: player.position.y, z: player.position.z })
				trial.version++
				saveQueue.chunkData[`${Math.floor(player.referingWorldObjectPosition.x / 32)} ${Math.floor(player.referingWorldObjectPosition.y / 32)}`] = true
				player.message(`Added checkpoint fruit #${trial.checkpoints.length}! ID: ${player.referingWorldObject} at chunk: ${player.referingWorldObjectPosition.x} ${player.referingWorldObjectPosition.y}`)
				soundbrick(
					{
						url: "/sounds/random/TMPmajor.ogg", // [Required]
						isGlobal: true,
					},
					player
				)
			} else {
				player.message("This object isn't a time trial!")
			}
		} else {
			player.message("There wasn't a referenced time trial beforehand!")
		}
	}
})

Game.command("endposition", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		if (player.referingWorldObject) {
			const meta = await voxelWorld.getChunkMeta(player.referingWorldObjectPosition.x, player.referingWorldObjectPosition.y)
			const portal = meta.objects.find((obj) => obj.id === player.referingWorldObject)
			if (portal.objectName == "portal") {
				portal.toPosition = { x: player.position.x, y: player.position.y, z: player.position.z }
				// trial.checkpoints.push({ x: player.position.x, y: player.position.y, z: player.position.z })
				// trial.version++
				saveQueue.chunkData[`${Math.floor(player.referingWorldObjectPosition.x / 32)} ${Math.floor(player.referingWorldObjectPosition.y / 32)}`] = true
				player.message(`End position set! ID: ${player.referingWorldObject} at chunk: ${player.referingWorldObjectPosition.x} ${player.referingWorldObjectPosition.y}`)
				soundbrick(
					{
						url: "/sounds/random/TMPmajor.ogg", // [Required]
						isGlobal: true,
					},
					player
				)
			} else {
				player.message("This object isn't a portal!")
			}
		} else {
			player.message("There wasn't a referenced portal beforehand!")
		}
	}
})

Game.command("endtimetrial", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		if (player.referingWorldObject) {
			const meta = await voxelWorld.getChunkMeta(player.referingWorldObjectPosition.x, player.referingWorldObjectPosition.y)
			const trial = meta.objects.find((obj) => obj.id === player.referingWorldObject)
			if (trial.objectName == "timetrial") {
				trial.endPosition = { x: player.position.x, y: player.position.y, z: player.position.z }
				trial.version++
				saveQueue.chunkData[`${Math.floor(player.referingWorldObjectPosition.x / 32)} ${Math.floor(player.referingWorldObjectPosition.y / 32)}`] = true
				player.message(`trial ending position set! ID: ${player.referingWorldObject} at chunk: ${player.referingWorldObjectPosition.x} ${player.referingWorldObjectPosition.y}`)
				soundbrick(
					{
						url: "/sounds/random/TMPmajor.ogg", // [Required]
						isGlobal: true,
					},
					player
				)
			} else {
				player.message("This object isn't a time trial!")
			}
		} else {
			player.message("There wasn't a referenced time trial beforehand!")
		}
	}
})

Game.command("objectinfo", async (player, msg) => {
	// Inspect object
	if (player.currentCreature.class === "builder") {
		if (player.referingWorldObject) {
			soundbrick(
				{
					url: "/sounds/random/TMPmajor.ogg", // [Required]
					isGlobal: true,
				},
				player
			)
		} else {
			player.message("There wasn't a referenced world object beforehand!")
		}
	}
})

Game.command("createobject", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		switch (msg) {
			case "timetrial":
				var blockPos = new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4))

				var chunkx = Math.floor(blockPos.x / 16)
				var chunky = Math.floor(blockPos.y / 16)

				var meta = await voxelWorld.getChunkMeta(chunkx, chunky)
				var worldObject = new (require("../worldObjects/worldObject.js"))("timetrial")
				var id = worldObject.id
				worldObject.startPosition = { x: player.position.x, y: player.position.y, z: player.position.z }
				worldObject.endPosition = { x: player.position.x, y: player.position.y, z: player.position.z }
				meta.objects.push(worldObject)
				saveQueue.chunkData[`${Math.floor(chunkx / 32)} ${Math.floor(chunky / 32)}`] = true
				player.message(`Added time trial! Now refering to ID: ${id} at chunk: ${chunkx}, ${chunky}`)
				player.referingWorldObject = id
				player.referingWorldObjectPosition = { x: chunkx, y: chunky }

				soundbrick(
					{
						url: "/sounds/random/TMPmajor.ogg", // [Required]
						isGlobal: true,
					},
					player
				)
				break
			case "landmark":
				var blockPos = new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4))

				var chunkx = Math.floor(blockPos.x / 16)
				var chunky = Math.floor(blockPos.y / 16)

				var meta = await voxelWorld.getChunkMeta(chunkx, chunky)
				var worldObject = new (require("../worldObjects/worldObject.js"))("landmark")
				var id = worldObject.id
				worldObject.position = { x: player.position.x, y: player.position.y, z: player.position.z }
				meta.objects.push(worldObject)
				saveQueue.chunkData[`${Math.floor(chunkx / 32)} ${Math.floor(chunky / 32)}`] = true
				player.message(`Added landmark! Now refering to ID: ${id} at chunk: ${chunkx}, ${chunky}`)
				player.referingWorldObject = id
				player.referingWorldObjectPosition = { x: chunkx, y: chunky }

				soundbrick(
					{
						url: "/sounds/random/TMPmajor.ogg", // [Required]
						isGlobal: true,
					},
					player
				)
				break
			case "portal":
				var blockPos = new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4))

				var chunkx = Math.floor(blockPos.x / 16)
				var chunky = Math.floor(blockPos.y / 16)

				var meta = await voxelWorld.getChunkMeta(chunkx, chunky)
				var worldObject = new (require("../worldObjects/worldObject.js"))("portal")
				var id = worldObject.id
				worldObject.position = { x: player.position.x, y: player.position.y, z: player.position.z }
				meta.objects.push(worldObject)
				saveQueue.chunkData[`${Math.floor(chunkx / 32)} ${Math.floor(chunky / 32)}`] = true
				player.message(`Added portal! Now refering to ID: ${id} at chunk: ${chunkx}, ${chunky}`)
				player.referingWorldObject = id
				player.referingWorldObjectPosition = { x: chunkx, y: chunky }

				soundbrick(
					{
						url: "/sounds/random/TMPmajor.ogg", // [Required]
						isGlobal: true,
					},
					player
				)
				break
			case "memo":
				break
			default:
				player.message(`Use \\c2/createobject timetrial \\c0to create a time trial object`)
				player.message(`Use \\c2/createobject landmark \\c0to create a landmark object`)
				player.message(`Use \\c2/createobject portal \\c0to create a portal object`)
				// player.message(`\\c3/createobject juicer \\c0Gives a player the ability to mark once`)
				// player.message(`\\c3/createobject memo \\c0Multi-line message`)
				break
		}
	}
})

Game.command("objecthelp", async (player, msg) => {
	player.message(`Use \\c2/createobject \\c0to create world object`)
	player.message(`Use \\c2/getobject \\c0to reference a object by id in the current data chunk for edit commands`)
})

Game.command("getobject", async (player, msg) => {
	if (player.currentCreature.class === "builder") {
		let blockPos = new Vector3(Math.floor(player.selectorBrick.position.x / 4), Math.floor(player.selectorBrick.position.y / 4), Math.floor(player.selectorBrick.position.z / 4))

		let chunkx = Math.floor(blockPos.x / 16)
		let chunky = Math.floor(blockPos.y / 16)

		let meta = await voxelWorld.getChunkMeta(chunkx, chunky)

		let trial = meta.objects.find((obj) => obj.id === msg)
		if (trial) {
			player.referingWorldObject = trial.id
			player.referingWorldObjectPosition = { x: chunkx, y: chunky }
			soundbrick(
				{
					url: "/sounds/random/TMPmajor.ogg", // [Required]
					isGlobal: true,
				},
				player
			)
			player.message(`Now refering to ID: ${trial.id} at chunk: ${chunkx}, ${chunky}`)
		} else {
			player.message("Can't find world object! Are you in the correct chunk?")
		}
	}
})

function createChunkMeta(x, y) {
	var data = {
		dataVersion: 3,
		objects: [],
		waterLevel: 0,
		waterEnabled: false,
		waterColor: 5,
		drownType: true,
	}

	return data
}

async function createPlayerData(id) {
	var data = {
		error: false,
		username: "Undefined Spaceman",
		dataVersion: 2,
		maxClaims: 5,
		homeEnabled: false,
		homeSpawn: { x: 0, y: 0, z: 0 }, // BH system
		claims: [],
		lastGlobalBlocks: 0,
		items: {
			spendablePoints: 0,
			speedBlocks: 0,
			jumpBlocks: 0,
		},

		stats: {
			totalPointsCollected: 0,
			totalBlocksPlaced: 0,
			totalBlocksPlacedByColorID: {},
			totalBlocksRemoved: 0,
			totalBlocksGlassifyed: 0,
		},
	}

	let t = new Date()
	t.setDate(t.getDate() + 1)
	t.setHours(0)
	t.setMinutes(0)
	t.setSeconds(0)
	t.setMilliseconds(0)

	data.dailyRewardDate = t.getTime()

	// await fs.writeFile(`./voxelStorage/${Game.serverSettings.sepraType}/savedata/players/${id}.json`, JSON.stringify(data), function (err) {
	// 	if (err) throw err;
	// 	console.log(`Saved ${id}.json meta`);
	// });

	return data
}

function deltaE(rgbA, rgbB) {
	let labA = rgb2lab(rgbA)
	let labB = rgb2lab(rgbB)
	let deltaL = labA[0] - labB[0]
	let deltaA = labA[1] - labB[1]
	let deltaB = labA[2] - labB[2]
	let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2])
	let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2])
	let deltaC = c1 - c2
	let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC
	deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH)
	let sc = 1.0 + 0.045 * c1
	let sh = 1.0 + 0.015 * c1
	let deltaLKlsl = deltaL / 1.0
	let deltaCkcsc = deltaC / sc
	let deltaHkhsh = deltaH / sh
	let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh
	return i < 0 ? 0 : Math.sqrt(i)
}

function rgb2lab(rgb) {
	let r = rgb[0] / 255,
		g = rgb[1] / 255,
		b = rgb[2] / 255,
		x,
		y,
		z
	r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
	g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
	b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92
	x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
	y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0
	z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
	x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116
	return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

async function mapRenderByChunks() {
	var chunkArray = Object.entries(globalData.mapRenderQueue) // chunkArray[x][1]

	function save() {
		// console.log("Complete!")
		// img.toBuffer((err, buf) => {
		// 	if (err) throw err // encoding failed
		// 	// buf is PNG-encoded image
		// 	fs.writeFile(`./voxelStorage/${Game.serverSettings.sepraType}/latest.png`, buf, function (err) {
		// 		if (err) throw err;
		// 		console.log(`Saved png!`);
		// 		globalData.mapRenderQueue = {}
		// 		saveQueue.saveGlobal = true
		// 	});
		// })
		isRendering = false
	}
	if (chunkArray.length !== 0) {
		isRendering = true
		console.log("Generating map")
		var len = 0
		chunkArray.forEach(async (element) => {
			console.log(element)

			var Bx = element[1].x * 32
			var By = element[1].y * 32

			for (var x = 0; x < 32; x++) {
				for (var y = 0; y < 32; y++) {
					for (var z = 255; z > 20; z--) {
						var blocktype = await voxelworld.getBlockType(new Vector3(x + Bx, y + By, z))
						if (blocktype !== 0) {
							var finalBright = 0
							if ((await voxelworld.getBlockType(new Vector3(x + Bx + 1, y + By, z))) == 0) {
								finalBright += 16
							}
							if ((await voxelworld.getBlockType(new Vector3(x + Bx - 1, y + By, z))) == 0) {
								finalBright += -16
							}
							if ((await voxelworld.getBlockType(new Vector3(x + Bx, y + By + 1, z))) == 0) {
								finalBright += 16
							}
							if ((await voxelworld.getBlockType(new Vector3(x + Bx, y + By - 1, z))) == 0) {
								finalBright += -16
							}
							// ctx.fillStyle = `rgba(${(colorbyid[blocktype].rgb.r) + Math.round((80 / 0.4) * 1.7) - 264 + finalBright},${colorbyid[blocktype].rgb.g + Math.round((80 / 0.4) * 1.7) - 264 + finalBright},${colorbyid[blocktype].rgb.b + Math.round((80 / 0.4) * 1.7) - 264 + finalBright},1)`;
							// ctx.fillRect(x + Bx + 1024, y + By + 1024, 1, 1);
							break
						}
					}
				}
			}

			len++
			if (len == chunkArray.length) {
				save()
			}
		})
	}

	//
}

async function idleGameWork() {
	isRendering = false
	startX = -1024
	startZ = -1024
	preloadOffset = -64
	// img = canvas.createCanvas(2048, 2048)
	// ctx = img.getContext('2d')
	// fs.readFile(`./voxelStorage/${Game.serverSettings.sepraType}/latest.png`, (err, squid) => {
	// 	if (err) throw err
	// 	im = new canvas.Image()
	// 	im.onload = () => {
	// 		//ctx = img.getContext('2d')
	// 		ctx.drawImage(im, 0, 0)
	// 	}
	// 	im.onerror = err => { throw err }
	// 	im.src = squid

	// })
	//console.log(img)

	setInterval(() => {
		//let heap = process.memoryUsage().heapUsed
		//console.log(`${Math.floor(heap/1000000)}MB / 3000MB (${Math.floor((heap/1000000)/3000)*100}%)`);
		if (isRendering == false) {
			if (Game.players.length == 0) {
				mapRenderByChunks()
			}
		}
	}, 10000)
}
idleGameWork()

module.exports = { world: voxelworld, placeblock, pickcolor, colorbyid, getChunkMeta, addSectionToQueue }
