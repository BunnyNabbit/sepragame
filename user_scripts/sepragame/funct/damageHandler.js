const constants = require("../constants.js")

function damageHandler(vit, attacker, attack, damage) {
	if (vit.alive == true) {
		particleManager.emitParticle("bloodsmall", vit.position)
		if (vit.isBot == false) {
			vit.setHealth(vit.health += damage)
		} else {
			botManager.botController.damage(vit, damage)
		}

		if (randomIntFromInterval(1, 10) == 1 || damage >= 50) {
			soundbrick({
				url: `/sounds/pain/${vit.currentCreature.voice}/pain${randomIntFromInterval(1, 6)}.flac`,
				position: vit.position,
				isGlobal: false,
				minDistance: 35,
				maxDistance: 10,
			})
		}
		if (!vit.alive) {
			soundbrick({
				url: `/sounds/pain/${vit.currentCreature.voice}/pain${randomIntFromInterval(1, 6)}.flac`,
				position: vit.position,
				isGlobal: false,
				minDistance: 70,
				maxDistance: 10,
			})
			if (vit.isBot == false) {
				Game.messageAll(`\\c6${attack.killmessage.replace("(killer)", attacker.username).replace("(victim)", vit.username)}`)
				if (constants.discordEnabled) bot.channels.get(channel).send(`${attacker.currentCreature.discordEmoji} ${attacker.username} ${attack.discordEmoji} ${vit.currentCreature.discordEmoji} ${vit.username}`)
			}

		}
	}
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}


module.exports = damageHandler