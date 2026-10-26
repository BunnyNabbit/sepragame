function clc(bot, attack) {
	attack(bot)
	if (randomIntFromInterval(1, 15) == 1) {
		// spam the attack
		setTimeout(
			() => {
				attack(bot)
			},
			randomIntFromInterval(47, 330)
		)
		setTimeout(
			() => {
				attack(bot)
			},
			randomIntFromInterval(87, 330)
		)
		setTimeout(
			() => {
				attack(bot)
			},
			randomIntFromInterval(87, 330)
		)
		setTimeout(
			() => {
				attack(bot)
			},
			randomIntFromInterval(87, 330)
		)
		setTimeout(
			() => {
				attack(bot)
			},
			randomIntFromInterval(87, 330)
		)
	}
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = clc
