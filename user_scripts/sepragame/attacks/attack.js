let slash = require("./slash.js")
let blastJump = require("./blastJump.js")
let projectile = require("./projectile.js")
let homingMissle = require("./homingMissle.js")
let dash = require("./dash.js")
let spikes = require("./spikes.js")
let block = require("./block.js")
let crystal = require("./crystal.js")
let reflect = require("./reflect.js")
let fluidPool = require("./fluidPool.js")
let chargedProjectile = require("./chargedProjectile.js")
// why??
class Attack {
	constructor(template) {
		// Bot behavior
		this.useMinRadius = 0
		this.useMaxRadius = 50
		this.weight = 1
		this.attackClass = "ranged"
		switch (template) {
			case "slash":
				var that = this
				this.use = function (player) {
					slash(player, that)
				}
				this.attackClass = "melee"
				this.damage = -35
				this.cooldown = 20
				this.radius = 13
				this.attackHeightOffset = 5
				this.energyCost = 20
				this.particle = "slash"
				this.attackDescription = { name: "Claws", description: "", killmessage: "(killer) slashed (victim)", discordEmoji: ":swords:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/placeholder.mp3`,
						position: player.position,
						isGlobal: false,
						minDistance: 80,
						maxDistance: 20,
					})
				}
				this.attackHit = function (vit, player) {
					soundbrick({
						url: `/sounds/voxel/gems/birdtheft/pain1.flac`,
						position: vit.position,
						isGlobal: false,
						minDistance: 80,
						maxDistance: 20,
					})
				}
				this.attackExtra = noop
				break;
			case "blastJump":
				var that = this
				this.use = function (player) {
					blastJump(player, that)
				}
				this.attackClass = "melee"
				this.color = "#ff0000"
				this.blastDamage = -35
				this.debrisDamage = -4
				this.cooldown = 150
				this.energyCost = 20
				this.attackDescription = { name: "Blast Jump", description: "Uses 20% energy. | Cooldown 15 seconds", killmessage: "(killer) decimated (victim)", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/random/emergeTEMP.ogg`,
						position: player.position,
						isGlobal: false,
						minDistance: 300,
						maxDistance: 20,
					})
				}
				this.onBlast = function (player) {
					soundbrick({
						url: `/sounds/random/explosive.mp3`,
						position: player.position,
						isGlobal: false,
						minDistance: 300,
						maxDistance: 20,
					})
				}
				this.attackHit = noop
				this.attackExtra = noop
				break;
			case "projectile":
				var that = this
				this.use = function (player) {
					projectile(player, that)
				}
				this.mouthXOffset = 0
				this.mouthYOffset = 0
				this.attackHeightOffset = 5
				this.size = 1
				this.lifespan = 60
				this.decay = 20
				this.speed = 1
				this.radius = 5
				this.reflectable = false
				this.duoBlaster = false // i.e: Guna has 2 blasters, switch between them.
				this.triShot = false // i.e: Weakling2 will tri-shot.
				this.color = "#ff0000"
				this.damage = -8
				this.cooldown = -1
				this.energyCost = 5
				this.attackDescription = { name: "Lame Cannon", description: "Use 5% energy to blast jump onto the heights! | Cooldown 15 seconds", killmessage: "(killer) killed (victim)", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/creature/guna/attacks/crimsonblasterfire.mp3`,
						position: player.position,
						isGlobal: false,
						minDistance: 70,
						maxDistance: 3,
					})
				}
				this.attackHit = noop
				this.attackExtra = noop
				break;
			case "homingMissle":
				var that = this
				this.use = function (player) {
					homingMissle(player, that)
				}
				this.mouthXOffset = 0
				this.mouthYOffset = 0
				this.attackHeightOffset = 5
				this.size = 1
				this.lifespan = 350
				this.speed = 0.7
				this.radius = 5
				this.reflectable = false
				this.duoBlaster = false // i.e: Guna has 2 blasters, switch between them.
				this.triShot = false // i.e: Weakling2 will tri-shot.
				this.color = "#ff0000"
				this.damage = -8
				this.cooldown = -1
				this.energyCost = 50
				this.seekRadius = 30
				this.attackDescription = { name: "The Red Rocket", description: "An amazing invention!", killmessage: "(killer) 'sploded (victim)", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/random/err.flac`,
						position: player.position,
						isGlobal: false,
						minDistance: 70,
						maxDistance: 30,
					})
				}
				this.attackHit = function (position) {
					soundbrick({
						url: `/sounds/random/heavyexplosion.flac`,
						position: position,
						isGlobal: false,
						minDistance: 200,
						maxDistance: 50,
					})
					particleManager.emitParticle("explosion", position)
				}
				this.attackExtra = noop
				break;
			case "dash":
				var that = this
				this.use = function (player) {
					dash(player, that)
				}
				this.damage = -20
				this.cooldown = 50
				this.energyCost = 60
				this.radius = 15
				this.attackDescription = { name: "Blast Jump", description: "Uses 20% energy. | Cooldown 15 seconds", killmessage: "killed", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/creature/weaklings/1/attacks/dash.mp3`,
						position: player.position,
						isGlobal: false,
						minDistance: 70,
						maxDistance: 30,
					})
				}
				this.attackHit = function (player) {
					soundbrick({
						url: `/sounds/voxel/gems/birdtheft/pain1.flac`,
						position: testfor.position,
						isGlobal: true,
						minDistance: 30,
						maxDistance: 3,
					})
				}
				this.attackExtra = noop
				break;
			case "spikes":
				var that = this
				this.use = function (player) {
					spikes(player, that)
				}
				this.color = "#ff0000"
				this.damage = -48
				this.cooldown = 50
				this.energyCost = 60
				this.attackDescription = { name: "Blast Jump", description: "Uses 20% energy. | Cooldown 15 seconds", killmessage: "(killer) killed (victim)", discordEmoji: ":boom:" }

				this.attackCreate = noop
				this.attackHit = noop
				this.attackExtra = noop
				break;
			case "block":
				var that = this
				this.use = function (player) {
					block(player, that)
				}
				this.damage = -28
				this.cooldown = 70
				this.energyCost = 35
				this.attackDescription = { name: "Blast Jump", description: "Uses 20% energy. | Cooldown 15 seconds", killmessage: "(killer) killed (victim)", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/creature/weaklings/1/attacks/dash.mp3`,
						position: player.position,
						isGlobal: false,
						minDistance: 70,
						maxDistance: 30,
					})
				}
				this.attackHit = noop
				this.attackExtra = noop
				break;
			case "crystal":
				var that = this
				this.use = function (player) {
					crystal(player, that)
				}
				this.attackClass = "melee"
				this.colors = { // FIXME: this object is being used as an array?
					"0": "#0000FF",
					"1": "#4d4dff",
					"2": "#9999ff",
				}
				this.projectileColor = "#0000ff"
				this.damage = -3
				this.cooldown = 70
				this.energyCost = 35
				this.attackDescription = { name: "Blast Jump", description: "Uses 20% energy. | Cooldown 15 seconds", killmessage: "(killer) killed (victim)", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/creature/weaklings/2/attacks/crystalspawn.mp3`,
						position: player.position,
						isGlobal: false,
						minDistance: 100,
						maxDistance: 30,
					})
				}
				this.attackHit = noop
				this.attackExtra = noop
				break;
			case "reflect":
				var that = this
				this.use = function (player) {
					reflect(player, that)
				}
				this.color = "#FF0000"
				this.damage = -0.5 // radiation
				this.cooldown = 50
				this.energyCost = 0
				this.attackDescription = { name: "Reflect", description: "Uses 20% energy. | Cooldown 15 seconds", killmessage: "(killer) killed (victim)", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/creature/guna/attacks/psulate.mp3`,
						position: player.position,
						isGlobal: false,
						minDistance: 100,
						maxDistance: 30,
					})
				}
				this.attackHit = noop
				this.attackExtra = noop
				break;
			case "fluidPool": // TODO: Rework color
				var that = this
				this.use = function (player) {
					fluidPool(player, that)
				}
				this.attackClass = "melee"
				this.colors = [ // animation
					"#FF0000",
					"#FF5900",
					"#FF8800",
					"#FF9D00",
					"#FF6600",
				]
				this.particle = "fire"
				this.color = "#FF0000"
				this.totalDamage = 40
				this.damagePerSecond = 5
				this.cooldown = 50
				this.energyCost = 5
				this.attackDescription = { name: "Fluids", description: "Uses 20% energy. | Cooldown 15 seconds", killmessage: "(killer) killed (victim)", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/creature/magmeer/bluff.mp3`,
						position: player.position,
						isGlobal: false,
						minDistance: 50,
						maxDistance: 10,
					})
				}
				this.attackHit = noop
				this.attackExtra = noop
				break;
			case "chargedProjectile":
				var that = this
				this.use = function (player) {
					chargedProjectile(player, that)
				}
				this.mouthXOffset = 0
				this.mouthYOffset = 0
				this.attackHeightOffset = 5
				this.size = 1
				this.lifespan = 130
				this.decay = 60
				this.speed = 3
				this.color = "#ff4d4d"
				this.damage = -65
				this.cooldown = 200
				this.energyCost = 45
				this.attackDescription = { name: "Lame Cannon", description: "Use 5% energy to blast jump onto the heights! | Cooldown 15 seconds", killmessage: "(killer) killed (victim)", discordEmoji: ":boom:" }

				this.attackCreate = function (player) {
					soundbrick({
						url: `/sounds/random/chargeTEMP.ogg`,
						position: player.position,
						isGlobal: false,
						minDistance: 250,
						maxDistance: 30,
					})
				}
				this.attackHit = noop
				this.attackExtra = noop
				break;

			default:
				break;
		}
	}
}

module.exports = Attack