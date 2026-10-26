let attack1 = require("./attacks/waterShot.js")
//let attack2 = require("./attacks/waterCrystal.js")
let attack2 = new Attack("blastJump")

var morphData = {
	creatureName: "Weakling (Variant 2)",
	discordEmoji: "<:weakling2icon:699338274367471636>",
	saveID: "weakling2yellow", // Used internally for saves
	attacks: {
		atk1: { script: attack1.use, name: "Fire Shots", description: "Use 12% energy to fire a fast moving low range low damage shot | Has a chance to tri-shot | 6 HP per projectile" },
		//atk2: { script: attack2, name: "Water Crystal", description: "Summon a turret to shoot at nearby creatures | Cooldown 40 seconds" },
		atk2: { script: attack2.use, name: "te,mp", description: "HSFJh -fs" },
		bite: { name: "Bite", killmessage: "killed", discordEmoji: "<:slashstill:817618397193175101>" },
	},
	hp: 45,
	speed: 5,
	sprintSpeed: 8,
	jump: 3,
	blastJumpPower: 8,
	energyRegen: 3, // per 0.1
	respawnEnergy: 100,
	description: "replace this desctipton with something else",
	charmodel: {
		hat1: 231507,
		hat2: 1,
		hat3: 1,
		rotateoffset: -270,
		cameraHeight: 0.9,
		animWalk1: 110,
		animWalk2: 210,
		animNone: 10,
		animIdle: 310,
		animDead: -90,
		mouth: {
			x: 4,
			y: 2
		} 
	},
	finished: false,
	usableAttacks: 1,
	showInSelector: false,
	stepSound: "flat",
	class: "creature",
	voice: "alienlike",

	webFileUrl: "weakling2.glb",
	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565 // for other player's model
}

module.exports = morphData