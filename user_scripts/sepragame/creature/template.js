// Example template of a player creature
// NOTE: Bots are considered different from players and this may change later on.


// Attacks can be first defined here.
// Example of attack 1: a simple projectile attack with some properties changed to make it blue and be slower
let attack1 = new Attack("projectile")
attack1.attackCreate = function (player) {
	soundbrick({
		url: `/sounds/voxel/glass_remove.mp3`,
		position: player.position,
		isGlobal: false,
		minDistance: 70,
		maxDistance: 3,
	})
}
// Kill messages can be customized with (killer) and (victim) replacing to their player names
attack1.attackDescription = { name: "Ice Shards", description: "Use 12% energy to shoot a projectile | 7 Damage", killmessage: "(killer) killed (victim)", discordEmoji: "<:bluecube:596827012962713611>" }
attack1.reflectable = true
attack1.damage = -7
attack1.color = "#66FFFF"
attack1.energyCost = 12
attack1.lifespan = 80
attack1.decay = 50
attack1.speed = 1.8
let attack2 = new Attack("spikes")
attack2.attackDescription = { name: "Spikes", description: "Use 55% energy to summon icey spikes | Cooldown 15 seconds | 48 Damage", killmessage: "(killer) killed (victim)", discordEmoji: "<:slashstill:817618397193175101>" }
attack2.color = "#66FFFF"
attack2.cooldown = 150
let attack3 = new Attack("block")
attack3.attackDescription = { name: "Throw Block", description: "Use 35% energy to throw terrain blocks | Cooldown 7 seconds | 28 Damage", killmessage: "(killer) killed (victim)", discordEmoji: "<:bluecube:596827012962713611>" }
attack3.cooldown = 70
let attack4 = new Attack("slash")
attack4.attackDescription = { name: "Frost Slash", description: "Use 25% energy to melee slash! | 35 Damage | Cooldown 35 seconds", killmessage: "(killer) slashed (victim)", discordEmoji: "<:slashstill:817618397193175101>" }
attack4.energyCost = 25
attack4.cooldown = 350
attack4.attackHit = function (vit, player) {
	soundbrick({
		url: `/sounds/claws-hit.flac`,
		position: vit.position,
		isGlobal: true,
		minDistance: 80,
		maxDistance: 20,
	})
	if (!vit.isBot) {
		for (let i = 0; i < 6; i++) {
			setTimeout(() => {
				vit.setSpeed(2)
			}, 1000 * i);
		}
		setTimeout(() => {
			vit.setSpeed(vit.currentCreature.speed)
		}, 7000);
	} else {
		for (let i = 0; i < 6; i++) {
			setTimeout(() => {
				vit.speed = 2
			}, 1000 * i);
		}
		setTimeout(() => {
			vit.speed = vit.currentCreature.speed
		}, 7000);
	}
}
// Blastjumps are required on every creature and may change later on.
let attack5 = new Attack("blastJump")
attack5.color = "#66ffff"

var morphData = {
	creatureName: "Shrivark", // Name of the creature. Displayed in the selector
	discordEmoji: "<:experimental1:792571919076687903>", // Displayed in the discord chat killfeed
	saveID: "shivark", // Used internally for saves
	attacks: { // All attacks that were defined previously. Attacks can be left out but must not leave any gaps in between the numbers.
		atk1: attack1,
		atk2: attack2,
		atk3: attack3,
		atk4: attack4,
		atk5: attack5,
		bite: { name: "Bite", killmessage: "(killer) nibbed on (victim)'s body a bit too much", discordEmoji: "<:slashstill:817618397193175101>" },
	},
	hp: 65,
	speed: 5,
	sprintSpeed: 8, // Speed when sprinting, should be higher than speed
	jump: 3, // Might not be used.
	blastJumpPower: 8, // Should be higher than jump
	energyRegen: 3, // per 0.1 (unused)
	respawnEnergy: 100,
	description: "replace this desctipton with something else", // not used
	charmodel: {
		hat1: 222932, // Assets to use in the Brick Hill version. Use asset 1 to remove assets.
		hat2: 1,
		hat3: 1,
		rotateoffset: -270, // The model may be rotated. This can be offset
		cameraHeight: 0.8, // For Brick Hill: Sets the player's height. Should be above the creature's model.
		animWalk1: 210, // Animation offsets height.
		animWalk2: 310,
		animNone: 110,
		animIdle: 410,
		animDead: -90,
		mouth: { // Position offset of the mouth. Mainly used for particles and attacks.
			x: 2,
			y: 1.3
		},
		bottom: { // Ventral area. Seemingly unused now..?
			x: -1,
			y: 1.4
		} 
	},
	finished: false, // unused
	usableAttacks: 1, // unused
	showInSelector: true, // Should creature appear in selector?
	stepSound: "claw", // Which pack of step sounds will be used? "claw" or "flaw"
	class: "creature", // "creature" for regular use. Other types exist to exclude from.
	voice: "alienlike",

	// Web client related
	webFileUrl: "weakling2.glb", // not used
	webModelRotationOffset: 1.565, // For the visual model
	webLogicRotationOffset: 0, // For converting BH rotation
	webNetworkRotationOffset: 1.565 // for other player's model
}

if (Game.serverSettings.sepraType === "chaotic") morphData.showInSelector = true

module.exports = morphData