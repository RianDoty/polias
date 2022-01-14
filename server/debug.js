//Tracks the amount of certain things for memory leak detection
const debugOn=false;
const debugValues = {};
module.exports = function increment(name = "default") {
  if (!debugOn) return;
  
  if (!debugValues[name]) {
    debugValues[name] = 0;
  }

  debugValues[name]++;
  const count = debugValues[name];
  if (count <= 100) {
    console.log(`${name}: ${count}`);
  } else if (count <= 1000) {
    console.warn(`${name}: ${count}`);
  } else {
    console.error(`${name}: ${count}`);
  }
};
