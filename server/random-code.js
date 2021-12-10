//Generates a random code that cannot have a duplicate
const usedCodes = {};

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function randomCode(length = 4) {
  const maxAttempts = 100;
  let attempts = 0;
  let data;
  do {
    data = "";
    for (let i = 0; i < length; i++) {
      const maxAttempts = 100;
      let randomIndex = Math.floor(Math.random() * letters.length); //Pick a random letter from the set

      data += letters[randomIndex];
    }
  } while (usedCodes[data] && attempts < maxAttempts);

  //Register a code as used
  usedCodes[data] = true;

  return data;
}

function unregisterCode(code = "") {
  //Make a code usable now that it doesn't have a purpose anymore
  delete usedCodes[code];
}

module.exports = { randomCode, unregisterCode };
