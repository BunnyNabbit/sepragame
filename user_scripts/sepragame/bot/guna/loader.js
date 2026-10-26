let attack1 = new Attack("projectile")
attack1.reflectable = true
attack1.attackDescription = { name: "Crimson Blaster", description: "Use 5% energy to shoot a fast moving bullet | 8 Damage", killmessage: "(killer) killed (victim)", discordEmoji: "<:redcube:596828524069912618>" }
attack1.color = "#ff0000"
attack1.energyCost = 5
attack1.lifespan = 130
attack1.decay = 70
attack1.duoBlaster = true
attack1.speed = 1.3
attack1.mouthXOffset = -1
attack1.mouthYOffset = 1
attack1.cooldown = 11
attack2 = new Attack("reflect")
attack2.cooldown *= 2
attack2.attackDescription = { name: "Pulse", description: "Reflect small high speed projectiles! | Cooldown 5 seconds", killmessage: "(killer) irradiated (victim)", discordEmoji: ":anger:" }
let attack3 = new Attack("chargedProjectile")
attack3.cooldown *= 2
attack3.attackDescription = { name: "Crimson Charge", description: "big blaster 45% energy | 65 Damage | Cooldown 20 seconds", killmessage: "(killer) killed (victim)", discordEmoji: "<:redcube:596828524069912618>" }

var data = {
	creatureName: "Guna", // Name of the creature | Used internally for lookup but thats bad bro
	discordEmoji: "<:guna:803430067014860840>",
	saveID: "guna", // Used internally for saves
	hp: 100,
	speed: 5,
	description: "define",
	bloodColor: "#ff0000",
	canBeEatten: true,
	totalBites: 3,
	biteRegenHP: 10,
	biteRegenStam: 75,
	attacks: {
		atk1: attack1,
		atk2: attack2,
		atk3: attack3,
		bite: { name: "Bite", killmessage: "killed", discordEmoji: ":crossed_swords:" },
	},
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
			y: 3
		}
	},
	finished: false,
	showInSelector: true,
	botType: "normal",
	stepSound: "claw",
	isWeakling: false,
	voice: "alienlike",


	//webFileUrl: "weakling2.glb",
	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565, // for other player's model

	// AI Behavior
	behavior: "angry",
	wonderIdleTimeMin: 4,
	wonderIdleTimeMax: 14,

	wonderMoveTimeMin: 3,
	wonderMoveTimeMax: 15
}

module.exports = data