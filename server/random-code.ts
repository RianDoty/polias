//Generates a random code that cannot have a duplicate
const usedCodes = new Set();

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""); //Array of all capital letters
export function randomCode(length = 4) {
  const maxAttempts = 100;
  let attempts = 0;
  let data: string;
  do {
    //Generate a random code
    data = "";
    for (let i = 0; i < length; i++) {
      let randomIndex = Math.floor(Math.random() * letters.length); //Pick a random letter

      data += letters[randomIndex];
    }
  } while (usedCodes.has(data) && attempts < maxAttempts);

  //Register a code as used
  usedCodes.add(data);

  return data;
}

export function unregisterCode(code = "") {
  //Make a code usable now that it doesn't have a purpose anymore
  usedCodes.delete(code)
}
