class Projectile extends Tickable { // TODO: use tickable stuff
	constructor(position, size, player) {
		super()
		this.position = position
		this.size = size
		this.player = player
	}

	destroy = function () {
	}
}

module.exports = Reflector