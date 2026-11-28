async function tool(player) {
	return player.message("This tool has been discontinued. Use \\c1/selection noise \\c0sub commands instead.")
}

module.exports = { use: tool, attackDescription: { name: "Paint Chunk", description: "Paint the whole chunk with the selected color" }, blockmode: "out" }
