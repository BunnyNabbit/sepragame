module.exports = function evaluateObject(obj, p) {
	if (Game.pointDistance3D(p.position, obj.position) > obj.activationRadius) return
	if (p.hovering) return

	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)

	p.setPosition(new Vector3(obj.toPosition.x, obj.toPosition.y, obj.toPosition.z))

	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)
	particleManager.emitParticle("ghost", p.position)

	p.lastVaildPosition = new Vector3(p.position.x, p.position.y, p.position.z)
	soundbrick(
		{
			url: `/sounds/port.ogg`,
			isGlobal: true,
		},
		p
	)
}
