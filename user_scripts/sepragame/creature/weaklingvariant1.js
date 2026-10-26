let attack1 = new Attack("slash")
attack1.attackDescription = { name: "Slash", description: "Use 25% energy to melee slash! | 35 Damage | Cooldown 2.5 seconds", killmessage: "(killer) killed (victim)", discordEmoji: "<:slashstill:817618397193175101>" }
attack1.energyCost = 25
attack1.cooldown = 25
attack1.damage = -35
let attack2 = new Attack("dash")
attack2.attackDescription = { name: "Dash", description: "Use 60% energy to quickly dash towards your direction. | 20 Damage | Cooldown 5 seconds", killmessage: "(killer) killed (victim)", discordEmoji: "<:slashstill:817618397193175101>" }
attack2.cooldown = 50
let attack3 = new Attack("blastJump")
attack3.color = "#0000FF"


var morphData = {
	creatureName: "Cyando Weakling (Variant 1)",
	discordEmoji: "<:weakling1:802646013759848498>",
	saveID: "cyando1", // Used internally for saves
	attacks: {
		atk1: attack1,
		atk2: attack2,
		atk3: attack3,
		bite: { name: "Bite", killmessage: "(killer) killed (victim)", discordEmoji: "<:slashstill:817618397193175101>" },
	},
	hp: 35,
	speed: 4,
	sprintSpeed: 7,
	jump: 3,
	blastJumpPower: 8,
	energyRegen: 3, // per 0.1
	respawnEnergy: 100,
	description: "temp description chnage this now",
	charmodel: {
		hat1: 116574,
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
			x: 1,
			y: 1.2
		},
		bottom: {
			x: -0.5,
			y: 1.2
		} 
	},
	finished: false,
	usableAttacks: 1,
	showInSelector: true,
	stepSound: "claw",
	class: "creature",
	voice: "young",

	webFileUrl: "weakling2.glb",
	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565 // for other player's model
}

module.exports = morphData