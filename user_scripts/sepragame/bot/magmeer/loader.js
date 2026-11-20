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
attack1.attackDescription = { name: "Fire Shots", description: "Use 9% energy to shoot a fire projectile | 7 Damage", killMessage: "(killer) killed (victim)", discordEmoji: "<:redcube:596828524069912618>" }
attack1.deflectable = true
attack1.damage = -7
attack1.color = "#FF6600"
attack1.energyCost = 9
attack1.lifespan = 130
attack1.decay = 70
attack1.speed = 0.8
attack1.weight = 1
attack1.cooldown = 8
let attack2 = new Attack("fluidPool")
attack2.weight = 2
attack2.cooldown *= 2
attack2.attackDescription = { name: "Magma Spit", description: "Use 20% energy to spit out magma! | 20 Total damage (5HP/s over 5s) | Cooldown 8 seconds", killMessage: "(killer) burnt (victim)", discordEmoji: "<:redcube:596828524069912618>" }

var data = {
	creatureName: "Magmeer", // Name of the creature | Used internally for lookup but thats bad bro
	discordEmoji: "<:magmeer:786149611457871892>",
	saveId: "magmeer", // Used internally for saves
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
		bite: { name: "Bite", killMessage: "killed", discordEmoji: ":crossed_swords:" },
	},
	characterModelOffsets: {
		cameraHeight: 1.4,
		mouth: {
			x: 5,
			y: 4,
		},
	},
	finished: false,
	showInSelector: true,
	botType: "normal",
	stepSound: "claw",
	isWeakling: false,
	voice: "alienlike",

	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565, // for other player's model

	// AI Behavior
	behavior: "angry",
	wanderIdleTimeMin: 4,
	wanderIdleTimeMax: 9,

	wanderMoveTimeMin: 3,
	wanderMoveTimeMax: 20,
}

function lookAtPoint(position, bot) {
	let angle = Math.atan2(position.y - bot.position.y, position.x - bot.position.x)
	angle = -(angle * (180 / Math.PI)) + 270
	return angle
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

async function findTopSurfaceOfWorld(position) {
	let pickX = Math.floor(position.x / 4) - 2
	let pickY = Math.floor(position.y / 4) - 2
	let result = 4

	for (let x = 0; x < 5; x++) {
		for (let z = 0; z < 5; z++) {
			for (let y = 200; y > 3; y--) {
				var success = false
				var block = await voxelWorld.world.getBlockType(new Vector3(pickX + x, y, pickY + z))

				switch (block) {
					case 0:
						break
					default:
						success = true

						break
				}

				if (success == true) {
					result = y * 4
					break
				}
			}
		}
	}
	return result + 8
}

module.exports = data
