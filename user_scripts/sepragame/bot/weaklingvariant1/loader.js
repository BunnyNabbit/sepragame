let attack1 = new Attack("slash")
attack1.attackDescription = { name: "Slash", description: "Use 25% energy to melee slash! | 35 Damage | Cooldown 2.5 seconds", killMessage: "(killer) killed (victim)", discordEmoji: "<:slashstill:817618397193175101>" }
attack1.energyCost = 25
attack1.cooldown = 350
attack1.damage = -35
attack1.cooldown = 50
let attack2 = new Attack("dash")
attack2.attackDescription = { name: "Dash", description: "Use 60% energy to quickly dash towards your direction. | 20 Damage | Cooldown 5 seconds", killMessage: "(killer) killed (victim)", discordEmoji: "<:slashstill:817618397193175101>" }
attack2.cooldown = 90
attack2.weight = 2
var data = {
	creatureName: "Scared Weakling (Variant 1)", // Name of the creature | Used internally for lookup but thats bad bro
	discordEmoji: "<:weakling1:802646013759848498>",
	saveId: "weakling1", // Used internally for saves
	hp: 35,
	speed: 5,
	description: "define",
	bloodColor: "#ff0000",
	canBeEaten: true,
	totalBites: 2,
	biteRegenerateHp: 10,
	biteRegenerateStamina: 75,
	attacks: {
		atk1: attack1,
		atk2: attack2,
	},
	characterModelOffsets: {
		cameraHeight: 0.9,
		mouth: {
			x: 1,
			y: 1.2,
		},
	},
	finished: false,
	showInSelector: true,
	botType: "scared",
	stepSound: "flat",
	isWeakling: true,
	voice: "young",

	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565, // for other player's model

	// AI Behavior
	behavior: "cowardly",
	wanderIdleTimeMin: 1,
	wanderIdleTimeMax: 5,

	wanderMoveTimeMin: 1,
	wanderMoveTimeMax: 8,
}

module.exports = data
