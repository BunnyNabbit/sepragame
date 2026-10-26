const fs = require("fs")
const dataPath = __dirname + "/data.json"
let filterData;
let rex;
// blockedWords contains disallowed words that don't have to be exact. This check is performed before and after the character trim process.
// blockedExactWords contains disallowed words that have to be exact to trigger filter. The words to detect are separated from any trimmed characters.
// blockedCharacters contains mostly unicode characters known to display in a way that can be disruptive.
// shadowedWords contain softly triggered words that make the message appear as if it got sent successfully for the player that said it. Mostly typos of common swears or other bypasses.
// trimCharacters are characters to trim in the filtering process.


function updateFilter() {
	let filterData = {}
	try {
		filterData = JSON.parse(fs.readFileSync(dataPath).toString())
	} catch (error) {
		console.error("Unable to load filter data.")
	}
	rex = {
		blockedWords: new RegExp(filterData?.blockedWords.join("|") ?? "water", "i"),
		blockedExactWords: new RegExp(filterData?.blockedExactWords.join("|") ?? "water", "i"),
		shadowedWords: new RegExp(filterData?.shadowedWords.join("|") ?? "water", "i"),
	}
}

fs.watchFile(dataPath, () => {
	console.log("updated filter")
	updateFilter()
})

updateFilter()

function isSwear(str) {
	// Pass 1 [Trimmed characters intact]

	// Blocked unicode characters.
	if (filterData?.blockedCharacters.some(blockedCharacter => str.includes(blockedCharacter))) return "Message contains blocked characters"
	// Blocked words
	if (rex.blockedWords.test(str)) return "Don't swear! Your message has not been sent."
	// Blocked exact words
	// Shadow blocked words
	if (rex.shadowedWords.test(str)) return true // Handled sliently

	// Pass 2 [Characters trimmed]
	filterData?.trimCharacters.forEach(trimCharacter => {
		str = str.replaceAll(trimCharacter, "")
	})

	// Blocked words
	if (rex.blockedWords.test(str)) return true//"Don't swear! Your message has not been sent."

	// Shadow blocked words
	if (rex.shadowedWords.test(str)) return true // Handled silently

	return false
}

module.exports = {
	isSwear,
	// rex,
	// filterData
}