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
attack1.attackDescription = { name: "Water Shots", description: "Use 12% energy to fire a fast moving low range low damage shot | Has a chance to tri-shot | 3 HP", killmessage: "(killer) splashed (victim)", discordEmoji: "<:bluecube:596827012962713611>" }
attack1.triShot = true
attack1.reflectable = true
attack1.color = "#0000ff"
attack1.damage = -3
attack1.energyCost = 12
attack1.lifespan = 50
attack1.decay = 30
attack1.speed = 1
attack1.cooldown = 12
let attack2 = new Attack("crystal")
attack2.attackDescription = { name: "Water Crystal", description: "Summon a turret to shoot at nearby creatures | Cooldown 40 seconds", killmessage: "(killer) killed (victim)", discordEmoji: "<:bluecube:596827012962713611>" }
attack2.weight = 0
attack2.cooldown *= 2
var data = {
	creatureName: "Scared Weakling (Variant 2)", // Name of the creature | Used internally for lookup but thats bad bro
	discordEmoji: "<:weakling2icon:699338274367471636>",
	saveID: "weakling2", // Used internally for saves
	hp: 45,
	speed: 5,
	description: "define",
	bloodColor: "#ff0000",
	canBeEatten: true,
	totalBites: 2,
	biteRegenHP: 10,
	biteRegenStam: 75,
	attacks: {
		atk1: attack1,
		atk2: attack2,
		bite: { name: "Bite", killmessage: "killed", discordEmoji: ":crossed_swords:" },
	},
	charmodel: {
		hat1: 117121,
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
			y: 2
		}
	},
	finished: false,
	showInSelector: true,
	botType: "scared",
	stepSound: "flat",
	isWeakling: true,
	voice: "alienlike",


	webFileUrl: "weakling2.glb",
	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565, // for other player's model

	// AI Behavior
	behavior: "cowardly",
	wonderIdleTimeMin: 4,
	wonderIdleTimeMax: 9,

	wonderMoveTimeMin: 3,
	wonderMoveTimeMax: 18
}


module.exports = data