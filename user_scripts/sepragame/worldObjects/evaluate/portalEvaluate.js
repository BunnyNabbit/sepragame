module.exports = function evaluateObject(portalObject, player) {
	if (Game.pointDistance3D(player.position, portalObject.position) > portalObject.activationRadius) return
	if (player.hovering) return

	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)

	player.setPosition(new Vector3(portalObject.toPosition.x, portalObject.toPosition.y, portalObject.toPosition.z))

	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)
	particleManager.emitParticle("ghost", player.position)

	player.lastValidPosition = new Vector3(player.position.x, player.position.y, player.position.z)
	soundbrick(
		{
			url: `/sounds/port.ogg`,
			isGlobal: true,
		},
		player
	)
}
