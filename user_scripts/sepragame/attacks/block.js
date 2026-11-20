async function attack(player, attack) {
	let selectedAttack = player.selectedAttack

	player[`atk${selectedAttack}Cooldown`] = 3

	let pos = new Vector3(player.position.x, player.position.y, player.position.z)

	let blockType = await voxelWorld.world.getBlockType(new Vector3(Math.floor(pos.x / 4), Math.floor(pos.y / 4) - 1, Math.floor(pos.z / 4)))
	if (blockType !== 0) {
		if (player.energy < attack.energyCost) return

		let brick = reuseHandler.reuseBrick()
		if (brick == -1) return

		player.energy -= attack.energyCost
		player[`atk${selectedAttack}Cooldown`] = attack.cooldown

		attack.attackCreate(player)

		soundbrick({
			url: `/sounds/remove_block.mp3`,
			position: player.position,
			isGlobal: false,
			minDistance: 100,
			maxDistance: 30,
		})
		soundbrick({
			url: `/sounds/eat/${randomIntFromInterval(1, 4)}.flac`,
			position: player.position,
			isGlobal: false,
			minDistance: 100,
			maxDistance: 30,
		})

		particleManager.emitParticle("debris", {
			position: new Vector3(player.position.x, player.position.y, player.position.z + 4),
			color: voxelWorld.blockColor[blockType].hexString,
		})
		particleManager.emitParticle("debris", {
			position: new Vector3(player.position.x, player.position.y, player.position.z + 4),
			color: voxelWorld.blockColor[blockType].hexString,
		})
		particleManager.emitParticle("debris", {
			position: new Vector3(player.position.x, player.position.y, player.position.z + 4),
			color: voxelWorld.blockColor[blockType].hexString,
		})
		particleManager.emitParticle("debris", {
			position: new Vector3(player.position.x, player.position.y, player.position.z + 4),
			color: voxelWorld.blockColor[blockType].hexString,
		})
		particleManager.emitParticle("debris", {
			position: new Vector3(player.position.x, player.position.y, player.position.z + 4),
			color: voxelWorld.blockColor[blockType].hexString,
		})

		brick.setColor(voxelWorld.blockColor[blockType].hexString)
		brick.setScale(new Vector3(4, 4, 4))
		brick.setPosition(new Vector3(player.position.x, player.position.y, player.position.z))
		let gravity = 0
		let time = 0
		let speed = 1.8
		let projectileRotation = player.rotation.z
		var loop = setInterval(() => {
			time++
			if (time < 10) {
				brick.position.x = player.position.x + 4 * Math.sin(player.rotation.z / debug) - 2
				brick.position.y = player.position.y - +4 * Math.cos(player.rotation.z / debug) - 2
				brick.position.z = player.position.z + 4 + gravity
				projectileRotation = player.rotation.z
				brick.setPosition(brick.position)
			} else {
				brick.position.x = brick.position.x += speed * Math.sin(projectileRotation / debug)
				brick.position.y = brick.position.y - +speed * Math.cos(projectileRotation / debug)
				brick.position.z = brick.position.z += gravity
				brick.setPosition(brick.position)
				if (world.reflectors.some((reflector) => Game.pointDistance3D(reflector.position, brick.position) < reflector.size && reflector.player !== player)) {
					// Reflectors
					player = world.reflectors.find((reflector) => Game.pointDistance3D(reflector.position, brick.position) < reflector.size && reflector.player !== player).player // Change the attacker
					projectileRotation += 180 // Change direction
				}

				var testedHit = testForHit(player, brick, 10)
				if (testedHit !== -1) {
					soundbrick({
						url: `/sounds/coal_blasted.ogg`,
						position: testedHit.position,
						isGlobal: true,
						minDistance: 100,
						maxDistance: 30,
					})
					particleManager.emitParticle("debris", {
						position: new Vector3(testedHit.position.x, testedHit.position.y, testedHit.position.z),
						color: voxelWorld.blockColor[blockType].hexString,
					})
					particleManager.emitParticle("debris", {
						position: new Vector3(testedHit.position.x, testedHit.position.y, testedHit.position.z),
						color: voxelWorld.blockColor[blockType].hexString,
					})
					particleManager.emitParticle("debris", {
						position: new Vector3(testedHit.position.x, testedHit.position.y, testedHit.position.z),
						color: voxelWorld.blockColor[blockType].hexString,
					})
					particleManager.emitParticle("debris", {
						position: new Vector3(testedHit.position.x, testedHit.position.y, testedHit.position.z),
						color: voxelWorld.blockColor[blockType].hexString,
					})
					particleManager.emitParticle("debris", {
						position: new Vector3(testedHit.position.x, testedHit.position.y, testedHit.position.z),
						color: voxelWorld.blockColor[blockType].hexString,
					})
					damageHandler(testedHit, player, attack.attackDescription, attack.damage)
					reuseHandler.deleteBrick(brick)
					clearInterval(loop)
				}
				if (time > 50) {
					gravity += -0.02
					speed += -0.01
					if (time > 80) {
						reuseHandler.deleteBrick(brick)
						clearInterval(loop)
					}
				}
			}
		}, 25)
	} else {
		soundbrick(
			{
				url: "/sounds/voxel/err.mp3", // [Required]
				isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
			},
			player
		)
	}
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = attack
