class Portal extends Tickable {
	// TODO: use tickable stuff
	constructor(portalPosition, teleportPosition, size) {
		super()
		this.position = portalPosition
		this.teleportPosition = teleportPosition
		this.size = size
		this.teleportCooldown = 0
		this.disallow = new Set()
	}

	destroy = function () {
		this.removeAllListeners()
		const index = world.portals.indexOf(this)

		if (index !== -1) world.portals.splice(index, 1)
	}
}
world.portals = [] // why not in class? :(

module.exports = Portal
