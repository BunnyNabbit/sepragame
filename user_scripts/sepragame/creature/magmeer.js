let attack1 = new Attack("projectile")
attack1.attackCreate = function (player) {
	soundbrick({
		url: `/sounds/fire-projectile.mp3`,
		position: player.position,
		isGlobal: false,
		minDistance: 70,
		maxDistance: 3,
	})
}
attack1.attackDescription = { name: "Fire Shots", description: "Use 9% energy to shoot a fire projectile | 7 Damage", killmessage: "(killer) killed (victim)", discordEmoji: "<:redcube:596828524069912618>" }
attack1.reflectable = true
attack1.damage = -7
attack1.color = "#FF6600"
attack1.energyCost = 9
attack1.lifespan = 130
attack1.decay = 70
attack1.speed = 0.8
let attack2 = new Attack("fluidPool")
attack2.cooldown = 80
attack2.attackDescription = { name: "Magma Spit", description: "Use 20% energy to spit out magma! | 20 Total damage (5HP/s over 5s) | Cooldown 8 seconds", killmessage: "(killer) burnt (victim)", discordEmoji: "<:redcube:596828524069912618>" }
attack2.energyCost = 20
let attack3 = new Attack("blastJump")
attack3.color = "#FF6600"

var morphData = {
	creatureName: "Magmeer",
	discordEmoji: "<:magmeer:786149611457871892>",
	saveID: "magmeer", // Used internally for saves
	attacks: {
		atk1: attack1,
		atk2: attack2,
		atk3: attack3,
		bite: { name: "Bite", killmessage: "(killer) killed (victim)", discordEmoji: "<:slashstill:817618397193175101>" },
	},
	hp: 135,
	speed: 4,
	sprintSpeed: 9,
	jump: 3,
	blastJumpPower: 8,
	energyRegen: 3, // per 0.1
	respawnEnergy: 100,
	description: "This is a description! Nothing much to see here.",
	charmodel: {
		hat1: 181917,
		hat2: 1,
		hat3: 1,
		rotateoffset: -270,
		cameraHeight: 1.4,
		animWalk1: 150,
		animWalk2: 250,
		animNone: 50,
		animIdle: 50,
		animDead: -50,
		mouth: {
			x: 5,
			y: 4,
		},
		bottom: {
			x: -2.5,
			y: 2.8,
		},
	},
	finished: false,
	usableAttacks: 1,
	showInSelector: true,
	stepSound: "claw",
	class: "creature",
	voice: "alienlike",

	//webFileUrl: "guna.glb",
	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565, // for other player's model
	//webModelRotationOffset: 3.13, // For the visual model
	//webLogicRotationOffset: 1.5, // For converting BH rotation
	//webNetworkRotationOffset: 0 // for other player's model
}

module.exports = morphData
