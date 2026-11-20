let attack1 = new Attack("projectile")
attack1.deflectable = true
attack1.attackDescription = { name: "Crimson Blaster", description: "Use 5% energy to shoot a fast moving bullet | 8 Damage", killMessage: "(killer) killed (victim)", discordEmoji: "<:redcube:596828524069912618>" }
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
attack2.attackDescription = { name: "Pulse", description: "Reflect small high speed projectiles! | Cooldown 5 seconds", killMessage: "(killer) irradiated (victim)", discordEmoji: ":anger:" }
let attack3 = new Attack("chargedProjectile")
attack3.cooldown *= 2
attack3.attackDescription = { name: "Crimson Charge", description: "big blaster 45% energy | 65 Damage | Cooldown 20 seconds", killMessage: "(killer) killed (victim)", discordEmoji: "<:redcube:596828524069912618>" }

var data = {
	creatureName: "Guna", // Name of the creature | Used internally for lookup but thats bad bro
	discordEmoji: "<:guna:803430067014860840>",
	saveId: "guna", // Used internally for saves
	hp: 100,
	speed: 5,
	description: "define",
	bloodColor: "#ff0000",
	canBeEaten: true,
	totalBites: 3,
	biteRegenerateHp: 10,
	biteRegenerateStamina: 75,
	attacks: {
		atk1: attack1,
		atk2: attack2,
		atk3: attack3,
		bite: { name: "Bite", killMessage: "killed", discordEmoji: ":crossed_swords:" },
	},
	characterModelOffsets: {
		cameraHeight: 1.4,
		mouth: {
			x: 4,
			y: 3,
		},
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
	wanderIdleTimeMin: 4,
	wanderIdleTimeMax: 14,

	wanderMoveTimeMin: 3,
	wanderMoveTimeMax: 15,
}

module.exports = data
