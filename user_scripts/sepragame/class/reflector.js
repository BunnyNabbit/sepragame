class Reflector extends Tickable {
	// TODO: use tickable stuff
	constructor(position, size, player) {
		super()
		this.position = position
		this.size = size
		this.player = player
	}

	destroy = function () {
		const index = world.reflectors.indexOf(this)

		if (index !== -1) world.reflectors.splice(index, 1)
	}
}
world.reflectors = [] // Objects with a position (vec3), size (number) and the player attacker (player). why not in class? :(

module.exports = Reflector
