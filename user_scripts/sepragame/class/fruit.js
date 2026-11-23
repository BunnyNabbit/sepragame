const pulsingBlue = ["#3399FF", "#6699ff"]

world.fruit = []

class Fruit {
	/**/
	static spawnFruit(position, pulsePattern = pulsingBlue) {
		let brick = reuseHandler.reuseBrick()
		if (brick == -1) return
		brick.setColor(pulsePattern[0])
		brick.setScale(new Vector3(1, 1, 1))
		brick.setOutline(true)
		brick.forceSetPosition(position)
		return new Fruit(position, pulsePattern, brick)
	}
	constructor(position, pulsePattern, brick) {
		// Create brick
		pulsePattern = pulsePattern || pulsingBlue
		position = new Vector3(position.x, position.y, position.z)
		this.brick = brick
		world.fruit.push(this)
		this.brick.setColor(pulsePattern[0])
		this.brick.setScale(new Vector3(1, 1, 1))
		this.brick.setOutline(true)
		this.brick.forceSetPosition(position)

		this.heldBy = null
		this.health = 10
		this.energy = 43
		this.stamina = 25
		this.persistent = false

		let time = 0
		this.loop = setInterval(() => {
			// Pulsing
			time++
			this.brick.setColor(pulsePattern[time % 2])
			if (!this.heldBy) {
				let messagePlayer = Game.players.find((player) => Game.pointDistance3D(player.position, this.brick.position) < 10)
				if (messagePlayer) {
					if (messagePlayer.mobile) {
						messagePlayer.centerPrint('\\c4Press "SLASH" to grab this Power Fruit', 2)
					} else messagePlayer.centerPrint('\\c4Press "E" to grab this Power Fruit', 2)
				}
			}
		}, 1000)

	}
	/**/
	eat(creature) {
		// Player or Bot
		if (creature.isBot) {
		} else {
			creature.centerPrint(`\\c5+ ${this.energy}% Energy`, 1)
			creature.setHealth(this.health + creature.health)
			creature.changeEnergy(this.energy)
			creature.changeStamina(this.stamina)
		}

		soundbrick({
			url: `/sounds/eat/bodyexplode.flac`,
			isGlobal: false,
			position: creature.position,
		})

		const settings = {
			color: this.brick.color,
			directionalForce: 0,
			direction: 0,
			expire: 200,
		}

		for (let index = 0; index < 5; index++) {
			let color = this.brick.color
			setTimeout(() => {
				let drippyPosition = new Vector3()
				drippyPosition.x = creature.position.x + creature.currentCreature.characterModelOffsets.mouth.x * Math.sin(creature.rotation.z / debug)
				drippyPosition.y = creature.position.y - +creature.currentCreature.characterModelOffsets.mouth.x * Math.cos(creature.rotation.z / debug)
				drippyPosition.z = creature.position.z + creature.currentCreature.characterModelOffsets.mouth.y - 0.8
				particleManager.emitParticle("drippy", {
					position: drippyPosition,
					color: color,
					directionalForce: 0,
					direction: 0,
					expire: 200,
				})
			}, 800 * index)
		}

		soundbrick({
			url: `/sounds/eat/${randomIntFromInterval(1, 4)}.flac`,
			isGlobal: false,
			position: creature.position,
		})
		this.drop(creature, false)
		this.remove()
	}

	drop(creature, sfx) {
		// Player or Bot
		if (sfx === undefined) sfx = true

		if (sfx)
			soundbrick({
				url: `/sounds/fruit/drop.mp3`,
				isGlobal: false,
				position: creature.position,
			})

		this.heldBy = null
		creature.holdingObject = null
	}

	hold(creature, sfx) {
		// Player or Bot
		if (!creature.holdingObject || !this.heldBy) {
			if (sfx === undefined) sfx = true

			if (sfx)
				soundbrick({
					url: `/sounds/fruit/grab.mp3`,
					isGlobal: false,
					position: creature.position,
				})

			if (!creature.isBot) {
				if (creature.mobile) {
					creature.centerPrint('\\c4Press "SLASH" to eat this Power Fruit', 2)
				} else creature.centerPrint('\\c4Press "E" to eat this Power Fruit or "Q" to drop it', 2)
			}
			creature.holdingObject = this
			this.heldBy = creature
		}
	}

	remove() {
		if (this.heldBy) this.heldBy.holdingObject = null
		delete this.heldBy // Fruit is a brick from reuseHandler so clean it up before returning it back

		const index = world.fruit.indexOf(this)

		if (index !== -1) world.fruit.splice(index, 1)

		reuseHandler.deleteBrick(this.brick)
		clearInterval(this.loop)
	}
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = Fruit
