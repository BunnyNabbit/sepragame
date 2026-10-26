function spikes(player, attack) {
	if (player.energy < attack.energyCost) return
	player.energy -= attack.energyCost
	player[`atk${player.selectedattack}Cooldown`] = attack.cooldown

	let pos = new Vector3(player.position.x, player.position.y, player.position.z)
	let prot = player.rotation.z

	setTimeout(() => {
		pos.x = pos.x += 14 * Math.sin(prot / debug)
		pos.y = pos.y - + 14 * Math.cos(prot / debug)
		spike(player, new Vector3(pos.x, pos.y, pos.z), attack)
	}, 100)
	setTimeout(() => {
		pos.x = pos.x += 14 * Math.sin(prot / debug)
		pos.y = pos.y - + 14 * Math.cos(prot / debug)
		spike(player, new Vector3(pos.x, pos.y, pos.z), attack)
	}, 200)
	setTimeout(() => {
		pos.x = pos.x += 14 * Math.sin(prot / debug)
		pos.y = pos.y - + 14 * Math.cos(prot / debug)
		spike(player, new Vector3(pos.x, pos.y, pos.z), attack)
	}, 300)
	setTimeout(() => {
		pos.x = pos.x += 14 * Math.sin(prot / debug)
		pos.y = pos.y - + 14 * Math.cos(prot / debug)
		spike(player, new Vector3(pos.x, pos.y, pos.z), attack)
	}, 400)
}

function spike(player, position, attack) {
	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	soundbrick({
		url: `/sounds/spikes-emerge.ogg`,
		position: position,
		isGlobal: false,
		minDistance: 60,
		maxDistance: 30,
	})

	brick.setOutline(true)
	brick.setColor(attack.color)
	brick.setScale(new Vector3(8, 8, 8))
	brick.setPosition(new Vector3(position.x-4, position.y-4, position.z-7))


	setTimeout(() => {
		brick.setScale(new Vector3(2, 2, 8))
		brick.setPosition(new Vector3(position.x-1, position.y-1, position.z))
		soundbrick({
			url: `/sounds/spikes.ogg`,
			position: brick.position,
			isGlobal: true,
			minDistance: 60,
			maxDistance: 45,
		})
		var testfor = testforHit(player, brick, 11)
		if (testfor !== -1) {
			soundbrick({
				url: `/sounds/projectile-hit.mp3`,
				position: testfor.position,
				isGlobal: true,
				minDistance: 30,
				maxDistance: 3,
			})
			damageHandler(testfor, player, attack.attackDescription, attack.damage)
		}
		setTimeout(() => {
			soundbrick({
				url: `/sounds/generalExplosion1.flac`,
				position: brick.position,
				isGlobal: true,
				minDistance: 60,
				maxDistance: 30,
			})
			reuseHandler.deleteBrick(brick)
		}, 500);
	}, 500);
}

module.exports = spikes