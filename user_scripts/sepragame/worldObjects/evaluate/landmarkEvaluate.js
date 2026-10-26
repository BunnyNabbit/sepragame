module.exports = function evaluateObject(obj, p) {
	if (Game.pointDistance3D(p.position, obj.position) > 50) return

	if (p.lastLandmark == obj.name) return
	p.lastLandmark = obj.name
	//p.message(`Discovered: ${obj.name}`)
	p.centerPrint(`${obj.name}`, 5)
	soundbrick(
		{
			url: "/sounds/skid.ogg", // [Required]
			isGlobal: true,
		},
		p
	)
}
