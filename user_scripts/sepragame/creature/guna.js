let attack1 = new Attack("projectile")
attack1.reflectable = true
attack1.attackDescription = { name: "Crimson Blaster", description: "Use 5% energy to shoot a fast moving bullet | 8 Damage", killmessage: "(killer) killed (victim)", discordEmoji: "<:redcube:596828524069912618>" }
attack1.color = "#ff0000"
attack1.energyCost = 7
attack1.lifespan = 130
attack1.decay = 70
attack1.duoBlaster = true
attack1.speed = 1.3
attack1.mouthXOffset = -1
attack1.mouthYOffset = 1
let attack2 = new Attack("blastJump")
attack3 = new Attack("reflect")
attack3.energyCost = 0
attack3.cooldown = 50
attack3.attackDescription = { name: "Pulse", description: "Reflect small high speed projectiles! | Cooldown 5 seconds", killmessage: "(killer) irradiated (victim)", discordEmoji: ":anger:" }
let attack4 = new Attack("chargedProjectile")
attack4.attackDescription = { name: "Crimson Charge", description: "big blaster 45% energy | 65 Damage | Cooldown 20 seconds", killmessage: "(killer) killed (victim)", discordEmoji: "<:redcube:596828524069912618>" }

var morphData = {
	creatureName: "Guna",
	discordEmoji: "<:guna:803430067014860840>",
	saveID: "guna", // Used internally for saves
	attacks: {
		atk1: attack1,
		atk2: attack2,
		atk3: attack3,
		atk4: attack4,
		bite: { name: "Bite", killmessage: "killed", discordEmoji: "<:slashstill:817618397193175101>" },
	},
	hp: 90,
	speed: 5,
	sprintSpeed: 8,
	jump: 3,
	blastJumpPower: 8,
	energyRegen: 3, // per 0.1
	respawnEnergy: 100,
	description: "This is a description! Nothing much to see here.",
	charmodel: {
		hat1: 46823,
		hat2: 67222,
		hat3: 1,
		rotateoffset: -270,
		cameraHeight: 1.4,
		animWalk1: 150,
		animWalk2: 250,
		animNone: 50,
		animIdle: 350,
		animDead: -50,
		mouth: {
			x: 4,
			y: 3,
		},
		bottom: {
			x: -0.7,
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
