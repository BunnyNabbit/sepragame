module.exports = function evaluateObject(obj, p) {
	if (Game.pointDistance3D(p.position, obj.position) > 50) return
}