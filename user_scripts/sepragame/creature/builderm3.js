let attack1 = require("../vtools/addWall.js")
let attack2 = require("../vtools/statBlock.js")
let attack3 = require("../vtools/paintChunk.js")
let attack4 = require("../vtools/debugData.js")
let attack5 = require("../vtools/fixData.js")

var morphData = {
	creatureName: "Builder",
	discordEmoji: ":tools:",
	saveID: "builderm3", // Used internally for saves and lookup
	attacks: {
		atk1: attack1,
		atk2: attack2,
		atk3: attack3,
		atk4: attack4,
		atk5: attack5,
		bite: { name: "Bite", killmessage: "abused", discordEmoji: "abused" },
	},
	hp: 10000,
	speed: 5,
	sprintSpeed: 20,
	jump: 3,
	blastJumpPower: 8,
	energyRegen: 3, // per 0.1
	respawnEnergy: 100,
	description: "This is a description! Nothing much to see here.",
	charmodel: {
		hat1: 231503,
		hat2: 231504,
		hat3: 1,
		rotateoffset: -270,
		cameraHeight: 1.4,
		animWalk1: 150,
		animWalk2: 250,
		animNone: 50,
		animIdle: 350,
		animDead: -50,
		mouth: {
			x: 0,
			y: 0
		} 
	},
	finished: false,
	usableAttacks: 5,
	showInSelector: false,
	stepSound: "claw",
	class: "builder",
	voice: "alienlike",

	//webFileUrl: "guna.glb",
	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565 // for other player's model
	//webModelRotationOffset: 3.13, // For the visual model
	//webLogicRotationOffset: 1.5, // For converting BH rotation
	//webNetworkRotationOffset: 0 // for other player's model
}

//if (Game.serverSettings.sepraType === "chaotic") morphData.showInSelector = true

module.exports = morphData