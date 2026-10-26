// So close! Zhat is not even a class💞
const pulsingBlue = ["#3399FF", "#6699ff"]

world.fruit = []

function spawnFruit(pos,pulse) {
	// Create brick
	pulse = pulse || pulsingBlue
	pos = new Vector3(pos.x, pos.y, pos.z)
	let fruit = reuseHandler.reuseBrick()
	if (fruit == -1) return
	world.fruit.push(fruit)
	fruit.setColor(pulse[0])
	fruit.setScale(new Vector3(1, 1, 1))
	fruit.setOutline(true)
	fruit.forceSetPosition(pos)

	fruit.heldBy = null
	fruit.health = 10
	fruit.energy = 43
	fruit.stamina = 25
	fruit.persistent = false

	let time = 0
	var loop = setInterval(() => { // Pulsing
		time++
		fruit.setColor(pulse[time % 2])
		if (!fruit.heldBy) {
			let messageplayer = Game.players.find(player => Game.pointDistance3D(player.position, fruit.position) < 10)
			if (messageplayer) {
				if (messageplayer.clientType === "Web") {
					if (messageplayer.mobile) {
						messageplayer.centerPrint("\\c4Press \"SLASH\" to grab this Power Fruit", 2)
					} else messageplayer.centerPrint("\\c4Press \"E\" to grab this Power Fruit", 2)
				} else {
					messageplayer.centerPrint("\\c4Press \"E\" to grab this Power Fruit", 2)
				}
			}
		}
	}, 1000);

	fruit.eat = function (creature) { // Player or Bot
		if (creature.isBot) {

		} else {
			creature.centerPrint(`\\c5+ ${fruit.energy}% Energy`, 1)
			creature.setHealth(fruit.health + creature.health)
			creature.changeEnergy(fruit.energy)
			creature.changeStamina(fruit.stamina)
		}

		soundbrick({
			url: `/sounds/eat/bodyexplode.flac`,
			isGlobal: false,
			position: creature.position
		})

		const settings = {
			color: fruit.color,
			directionalForce: 0,
			direction: 0,
			expire: 200,
		}

		for (let index = 0; index < 5; index++) {
			let color = fruit.color
			setTimeout(() => {
				drippyPosition = new Vector3
				drippyPosition.x = creature.position.x + creature.currentCreature.charmodel.mouth.x * Math.sin(creature.rotation.z / debug)
				drippyPosition.y = creature.position.y - + creature.currentCreature.charmodel.mouth.x * Math.cos(creature.rotation.z / debug)
				drippyPosition.z = creature.position.z + creature.currentCreature.charmodel.mouth.y - 0.8
				particleManager.emitParticle("drippy", {
					position: drippyPosition,
					color: color,
					directionalForce: 0,
					direction: 0,
					expire: 200,
				})
			}, 800 * index);
		}


		soundbrick({
			url: `/sounds/eat/${randomIntFromInterval(1, 4)}.flac`,
			isGlobal: false,
			position: creature.position
		})
		fruit.drop(creature, false)
		fruit.remove()
	}

	fruit.drop = function (creature, sfx) { // Player or Bot
		if (sfx === undefined) sfx = true

		if (sfx) soundbrick({
			url: `/sounds/fruit/drop.mp3`,
			isGlobal: false,
			position: creature.position
		})

		fruit.heldBy = null
		creature.holdingObject = null
	}

	fruit.hold = function (creature, sfx) { // Player or Bot
		if (!creature.holdingObject || !fruit.heldBy) {
			if (sfx === undefined) sfx = true

			if (sfx) soundbrick({
				url: `/sounds/fruit/grab.mp3`,
				isGlobal: false,
				position: creature.position
			})

			if (!creature.isBot) {
				if (creature.clientType === "Web") {
					if (creature.mobile) {
						creature.centerPrint("\\c4Press \"SLASH\" to eat this Power Fruit", 2)
					} else creature.centerPrint("\\c4Press \"E\" to eat this Power Fruit or \"Q\" to drop it", 2)
				} else {
					creature.centerPrint("\\c4Press \"E\" to eat this Power Fruit or \"Q\" to drop it", 2)
				}
			}
			creature.holdingObject = fruit
			fruit.heldBy = creature
		}
	}

	fruit.remove = function () {
		if (fruit.heldBy) fruit.heldBy.holdingObject = null
		delete fruit.heldBy // Fruit is a brick from reuseHandler so clean it up before returning it back

		const index = world.fruit.indexOf(this)

		if (index !== -1)
			world.fruit.splice(index, 1)

		reuseHandler.deleteBrick(fruit)
		clearInterval(loop)
	}

	return fruit
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = spawnFruit