const array = [
  000, 118, 127, 136, 145, 190, 226, 235, 244, 280, 334, 370, 460, 550, 299,
  389, 479, 488, 569, 578, 668, 677, 100, 119, 128, 137, 146, 155, 227, 236,
  245, 290, 335, 344, 380, 470, 560, 399, 489, 579, 588, 669, 678, 110, 200,
  129, 138, 147, 156, 228, 237, 246, 255, 336, 345, 390, 480, 570, 660, 499,
  589, 679, 688, 778, 777, 444, 120, 300, 111, 139, 148, 157, 166, 229, 238,
  247, 256, 337, 346, 355, 445, 490, 580, 670, 599, 689, 779, 788, 112, 130,
  220, 400, 149, 158, 167, 239, 248, 257, 266, 338, 347, 356, 446, 455, 590,
  680, 770, 699, 789, 113, 122, 140, 230, 500, 159, 168, 177, 249, 258, 267,
  339, 348, 357, 366, 447, 456, 690, 780, 799, 889, 888, 555, 114, 123, 150,
  240, 330, 600, 222, 169, 178, 259, 268, 277, 349, 358, 367, 448, 457, 466,
  556, 790, 880, 899, 115, 124, 133, 160, 223, 250, 340, 700, 179, 188, 269,
  278, 359, 368, 377, 449, 458, 467, 557, 566, 890, 116, 125, 134, 170, 224,
  233, 260, 350, 440, 800, 189, 279, 288, 369, 378, 459, 468, 477, 558, 567,
  990, 199, 289, 379, 388, 469, 478, 559, 568, 577, 667, 999, 666, 117, 126,
  135, 144, 180, 225, 234, 270, 360, 450, 900, 333,
];

const triplePanna = [];

for (let num of array) {
  const strNum = String(num).padStart(3, "0");
  if (strNum[0] === strNum[1] && strNum[1] === strNum[2]) {
    triplePanna.push(strNum);
  }
}

console.log(triplePanna);
console.log("Total Triple Panna:", triplePanna.length);
const singlePanna = [];

for (let num of array) {
  const strNum = String(num);
  if (
    strNum[0] !== strNum[1] &&
    strNum[1] !== strNum[2] &&
    strNum[2] !== strNum[0]
  ) {
    singlePanna.push(num);
  }
}

console.log(singlePanna);
console.log("Total Single Panna:", singlePanna.length);
const doublePanna = [];

for (let num of array) {
  const strNum = String(num);
  if (
    ((strNum[0] === strNum[1] && strNum[1] !== strNum[2]) ||
      (strNum[1] === strNum[2] && strNum[2] !== strNum[0]) ||
      (strNum[2] === strNum[0] && strNum[0] !== strNum[1])) &&
    num !== 0
  ) {
    doublePanna.push(num);
  }
}

console.log(doublePanna);
console.log("Total Double Panna:", doublePanna.length);


// spmotor and dpmotor functions
function filterDoublePanna(doublePannas, inputString) {
  // Convert the input string into a set of unique digits for easier comparison
  const inputDigits = new Set(inputString.split(''));

  // Filter the list of double pannas based on the condition that each digit
  // of a double panna must be present in the input string
  return doublePannas.filter(panna => {
    // Convert the panna to a string to check each digit
    const pannaString = panna.toString();
    // Check if every digit of the panna is in the inputDigits set
    return Array.from(pannaString).every(digit => inputDigits.has(digit));
  });
}

// Example usage with the provided list and a hypothetical input string "1234"
const doublePannas = [
  118, 226, 244, 334, 550, 299, 488, 668, 677, 100, 119,
  155, 227, 335, 344, 399, 588, 669, 110, 200, 228, 255,
  336, 660, 499, 688, 778, 300, 166, 229, 337, 355, 445,
  599, 779, 788, 112, 220, 400, 266, 338, 446, 455, 770,
  699, 113, 122, 500, 177, 339, 366, 447, 799, 889, 114,
  330, 600, 277, 448, 466, 556, 880, 899, 115, 133, 223,
  700, 188, 377, 449, 557, 566, 116, 224, 233, 440, 800,
  288, 477, 558, 990, 199, 388, 559, 577, 667, 117, 144,
  225, 900
];
const singlePannas = [127, 136, 145, 190, 235, 280, 370, 460, 389, 479, 569, 578, 128, 137, 146, 236, 245, 290, 380, 470, 560, 489, 579, 678, 129, 138, 147, 156, 237, 246, 345, 390, 480, 570, 589, 679, 120, 139, 148, 157, 238, 247, 256, 346, 490, 580, 670, 689, 130, 149, 158, 167, 239, 248, 257, 347, 356, 590, 680, 789, 140, 230, 159, 168, 249, 258, 267, 348, 357, 456, 690, 780, 123, 150, 240, 169, 178, 259, 268, 349, 358, 367, 457, 790, 124, 160, 250, 340, 179, 269, 278, 359, 368, 458, 467, 890, 125, 134, 170, 260, 350, 189, 279, 369, 378, 459, 468, 567, 289, 379, 469, 478, 568, 126, 135, 180, 234, 270, 360, 450]
const filteredPannas = filterDoublePanna(singlePannas, "0123456789");

console.log(filteredPannas);