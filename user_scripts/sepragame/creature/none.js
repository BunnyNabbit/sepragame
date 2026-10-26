var morphData = {
	creatureName: "Nothing existing", // Name of the creature
	discordEmoji: ":grey_question:",
	saveID: "none", // Used internally for saves and lookup
	attacks: {
		atk1: { use: noop, attackDescription: {} } // or its undefined and thats no good!
	},
	hp: 100,
	speed: 0,
	jump: 0,
	sprintSpeed: 0,
	energyRegen: 3, // per 0.1
	respawnEnergy: 100,
	description: "",
	charmodel: {
		hat1: 1,
		hat2: 1,
		hat3: 1,
		rotateoffset: -270,
		cameraHeight: 1.2,
		animWalk1: 110,
		animWalk2: 210,
		animNone: 10,
		animIdle: 10,
		animDead: -90,
		mouth: {
			x: 4,
			y: 3
		}
	},
	finished: false,
	usableAttacks: 0,
	showInSelector: false,
	saveData: false,
	stepSound: "claw",
	class: "none",
	voice: "alienlike",

	webModelRotationOffset: 0, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 0 // for other player's model
}

module.exports = morphData