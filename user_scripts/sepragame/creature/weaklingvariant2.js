let attack1 = new Attack("projectile")
attack1.attackCreate = function (player) {
	soundbrick({
		url: `/sounds/creature/weaklings/2/attacks/water.mp3`,
		position: player.position,
		isGlobal: false,
		minDistance: 70,
		maxDistance: 3,
	})
}
attack1.attackDescription = { name: "Light Cyando Shots", description: "Use 12% energy to fire a fast moving low range low damage shot | Has a chance to tri-shot | 3 HP", killmessage: "(killer) splashed (victim)", discordEmoji: "<:bluecube:596827012962713611>" }
attack1.triShot = true
attack1.reflectable = true
attack1.color = "#00FFFF"
attack1.damage = -3
attack1.energyCost = 12
attack1.lifespan = 50
attack1.decay = 30
attack1.speed = 1
let attack2 = new Attack("crystal")
attack2.attackDescription = { name: "Cyando Crystal", description: "Summon a turret to shoot at nearby creatures | Cooldown 40 seconds", killmessage: "(killer) killed (victim)", discordEmoji: "<:bluecube:596827012962713611>" }
attack2.energyCost = 0
attack2.cooldown = 400
attack2.colors = {
	// FIXME: this object is being used as an array?
	0: "#00ffff",
	1: "#80ffff",
	2: "#ccffff",
}
let attack3 = new Attack("blastJump")
attack3.color = "#00FFFF"

var morphData = {
	creatureName: "Cyando Weakling (Variant 2)",
	discordEmoji: "<:weakling2icon:699338274367471636>",
	saveID: "cyando2", // Used internally for saves
	attacks: {
		atk1: attack1,
		atk2: attack2,
		atk3: attack3,
		bite: { name: "Bite", killmessage: "(killer) killed (victim)", discordEmoji: "<:slashstill:817618397193175101>" },
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
		hat1: 231508,
		hat2: 1,
		hat3: 1,
		rotateoffset: -270,
		cameraHeight: 0.9,
		animWalk1: 110,
		animWalk2: 210,
		animNone: 10,
		animIdle: 10,
		animDead: -90,
		mouth: {
			x: 4,
			y: 2,
		},
		bottom: {
			x: -0.3,
			y: 1.4,
		},
	},
	finished: false,
	usableAttacks: 1,
	showInSelector: true,
	stepSound: "flat",
	class: "creature",
	voice: "alienlike",

	webFileUrl: "weakling2.glb",
	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565, // for other player's model
}

module.exports = morphData
