// A set of dunction patchs for node-hill objects.

function noop() {}

function patchBrick(brick) {
	brick.patcher = {}

	brick.forceSetPosition = brick.setPosition
	brick.setPosition = function (position) {
		brick.position = position

		let radiusPlayers = Game.players.filter((player) => Game.pointDistance3D(player.position, brick.position) < 200)

		radiusPlayers.forEach((player) => {
			socketio.emit("bpos", { netId: brick.netId, x: parseFloat(position.x.toFixed(2)), y: parseFloat(position.y.toFixed(2)), z: parseFloat(position.z.toFixed(2)) })
		})

		return
	}

	brick.disable = function () {
		socketio.emit("bdisable", brick.netId)
	}

	brick.onDelete = noop
}

module.exports = { patchBrick }
