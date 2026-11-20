module.exports = function evaluateObject(landmarkObject, player) {
	if (Game.pointDistance3D(player.position, landmarkObject.position) > 50) return

	if (player.lastLandmark == landmarkObject.name) return
	player.lastLandmark = landmarkObject.name
	//p.message(`Discovered: ${obj.name}`)
	player.centerPrint(`${landmarkObject.name}`, 5)
	soundbrick(
		{
			url: "/sounds/skid.ogg", // [Required]
			isGlobal: true,
		},
		player
	)
}
