function generateTimeArray() {
  const times = [];
  // Start time: 02:30
  let hour = 2;
  let minute = 30;
  while (!(hour === 24 && minute === 0)) {
    let timeString = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    times.push(timeString);
    minute += 5;
    if (minute === 60) {
      hour++;
      minute = 0;
    }
  }
  return times;
}
export const times = generateTimeArray();

// ======= Date, Date formate function  ========
export function formatDateAndDay(dateString) {
  const date = new Date(dateString);
  const monthAbbreviation = date.toLocaleString("default", { month: "short" });
  const dayName = date.toLocaleString("default", { weekday: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const formattedDate = `${monthAbbreviation} ${day} ${year}`;
  return { formattedDate, dayName };
}

// =========== gameCalculate functions ==============
export function calculateResult(bets) {
  if (bets.length === 0) {
    return Math.floor(Math.random() * 900) + 100;
  }
  const totalWinningsByNumber = {};
  for (let i = 0; i <= 9; i++) {
    totalWinningsByNumber[i] = 0;
  }
  bets.forEach((bet) => {
    if (bet.betType === "sd" && bet.onPlace >= 0 && bet.onPlace <= 9) {
      totalWinningsByNumber[bet.onPlace] += bet.betAmount * 9;
    }
  });
  const minBetAmount = Math.min(...Object.values(totalWinningsByNumber));
  const lowestBetNumbers = Object.entries(totalWinningsByNumber)
    .filter(([number, betAmount]) => betAmount === minBetAmount)
    .map(([number]) => parseInt(number));
  if (lowestBetNumbers.length <= 3) {
    return lowestBetNumbers;
  }
  const selectedNumbers = [];
  while (selectedNumbers.length < 3) {
    const randomIndex = Math.floor(Math.random() * lowestBetNumbers.length);
    const selectedNumber = lowestBetNumbers[randomIndex];
    if (!selectedNumbers.includes(selectedNumber)) {
      selectedNumbers.push(selectedNumber);
    }
  }
  selectedNumbers.sort(() => Math.random() - 0.5);
  let number = selectedNumbers[0].toString();
  let secondDigit = selectedNumbers[1].toString();
  while (secondDigit === number) {
    secondDigit = selectedNumbers[1].toString();
  }
  number += secondDigit;
  let thirdDigit = selectedNumbers[2].toString();
  while (thirdDigit === number[0] || thirdDigit === number[1]) {
    thirdDigit = selectedNumbers[2].toString();
  }
  number += thirdDigit;
  return number;
}
// =========== calculateOnesDigitOfSum ============
export function calculateOnesDigitOfSum(number) {
  const digits = number.toString().split("");
  const sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
  const onesDigit = sum % 10;
  return onesDigit;
}

//=========== containsDigit ============
export function containsDigit(number, digit) {
  const numberString = number.toString();
  const digitString = digit.toString();
  return numberString.includes(digitString);
}
