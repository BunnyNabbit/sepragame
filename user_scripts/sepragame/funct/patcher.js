// A set of dunction patchs for node-hill objects.

function noop() {}

function patchBrick(brick) {
	brick.patcher = {}

	brick.forceSetPosition = brick.setPosition
	brick.setPosition = function (position) {
		//TODO newbrick colors scales

		brick.position = position

		let radiusPlayers = Game.players.filter((player) => Game.pointDistance3D(player.position, brick.position) < 200)

		radiusPlayers.forEach((player) => {
			socketio.emit("bpos", { netId: brick.netId, x: parseFloat(position.x.toFixed(2)), y: parseFloat(position.y.toFixed(2)), z: parseFloat(position.z.toFixed(2)) })
		})

		return
		//return Game.brickFunction(brick)

		brick.b = brick.setColor
		brick.setColor = function (color) {
			socketio.emit("bc", { netId: brick.netId, c: color })
			brick.b(color)
		}
		brick.c = brick.setScale
		brick.setScale = function (scale) {
			socketio.emit("bs", { netId: brick.netId, x: scale.x, y: scale.y, z: scale.z })
			brick.c(scale)
		}
		brick.setOutline = function (bo) {
			// set outline true or falee
			socketio.emit("boutline", { netId: brick.netId, outline: bo })
			brick.outline = bo
		}
	}

	brick.disable = function () {
		socketio.emit("bdisable", brick.netId)
	}

	brick.onDelete = noop
}

module.exports = { patchBrick }
