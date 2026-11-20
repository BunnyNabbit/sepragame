module.exports = function evaluateObject(musicTriggerObject, player) {
	if (Game.pointDistance3D(player.position, musicTriggerObject.position) > 50) return
}
