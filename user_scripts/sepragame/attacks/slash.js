function slash(player, attack) {
	if (player.energy < attack.energyCost) return
	player.energy -= attack.energyCost
	player[`atk${player.selectedAttack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)

	if (attack.particle) particleManager.emitParticle(attack.particle, player.position)

	var testedHit = testForHit(player, { position: new Vector3(player.position.x, player.position.y, player.position.z + attack.attackHeightOffset) }, attack.radius)
	if (testedHit !== -1) {
		attack.attackHit(testedHit, player)

		damageHandler(testedHit, player, attack.attackDescription, attack.damage)
	}

	return
}

module.exports = slash
