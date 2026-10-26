function pulse(player, attack) {
	if (player.energy < attack.energyCost) return

	let brick = reuseHandler.reuseBrick()
	if (brick == -1) return

	player.energy -= attack.energyCost
	player[`atk${player.selectedattack}Cooldown`] = attack.cooldown

	attack.attackCreate(player)

	player.energy -= 5

	brick.setColor(attack.color)
	brick.setScale(new Vector3(16, 16, 16))

	brick.setPosition(new Vector3(player.position.x - 8, player.position.y - 8, player.position.z))

	let reflector = new Reflector(new Vector3(brick.position.x + 8, brick.position.y + 8, brick.position.z + 8), 18, player)
	addReflector(reflector)


	let time = 0
	var loop = setInterval(() => {
		time++

		var testfor = testforHit(player, brick, 10)
		if (testfor !== -1) {
			soundbrick({
				url: `/sounds/projectile-hit.mp3`,
				position: testfor.position,
				isGlobal: true,
				minDistance: 30,
				maxDistance: 3,
			})
			damageHandler(testfor, player, attack.attackDescription, attack.damage)
			//reuseHandler.deleteBrick(brick)
			//clearInterval(loop)
		}

		if (time > 25) {
			reflector.destroy()
			reuseHandler.deleteBrick(brick)
			clearInterval(loop)
		}
	}, 25);
}


//clearInterval(loop);
/*
killmessage: killed
discordimage: :crimsonbullet:
*/

module.exports = pulse