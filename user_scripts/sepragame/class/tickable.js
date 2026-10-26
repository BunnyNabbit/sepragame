class Tickable extends EventEmitter {
	// TODO: actually use this
	constructor() {
		super()
	}

	destroy = function () {
		this.removeAllListeners()
		const index = world.tickables.indexOf(this)

		if (index !== -1) world.tickables.splice(index, 1)
	}
}

world.tickables = [] // why not in class ? :(

setInterval(() => {
	// 10 TPS tickables. (Standard)
}, 100)

setInterval(() => {
	// (Slow)
}, 1000)

module.exports = Tickable
