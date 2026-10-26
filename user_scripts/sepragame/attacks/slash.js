function slash(player, attack) {
	if (player.energy < attack.energyCost) return
	player.energy -= attack.energyCost
	player[`atk${player.selectedattack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)

	if (attack.particle) particleManager.emitParticle(attack.particle, player.position)

	var testfor = testforHit(player, { position: new Vector3(player.position.x, player.position.y, player.position.z + attack.attackHeightOffset) }, attack.radius)
	if (testfor !== -1) {
		attack.attackHit(testfor, player)

		damageHandler(testfor, player, attack.attackDescription, attack.damage)
	}

	return
}

module.exports = slash
