function getStepURL(footType, material, step) {
	try {
		if (typeof stepSoundSet[footType][material][step] !== "undefined") {
			return stepSoundSet[footType][material][step]
		} else {
			console.log({ material }, { step })
			return stepSoundSet[footType].default[step]
		}
	} catch (error) {
		return stepSoundSet[footType].default[step]
	}
}

let claw = require("./stepCollection/claw.js")
let flat = require("./stepCollection/flat.js")

let stepSoundSet = {
	claw: claw,
	flat: flat,
}

module.exports = { stepSoundSet, getStepURL }
