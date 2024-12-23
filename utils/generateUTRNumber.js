export function generateUTRNumber() {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Month is zero-indexed
  const day = ("0" + currentDate.getDate()).slice(-2);
  const hours = ("0" + currentDate.getHours()).slice(-2);
  const minutes = ("0" + currentDate.getMinutes()).slice(-2);
  const seconds = ("0" + currentDate.getSeconds()).slice(-2);
  const milliseconds = ("00" + currentDate.getMilliseconds()).slice(-3);
  const dateTimeString =
    year + month + day + hours + minutes + seconds + milliseconds;
  const remainingDigits = 12 - dateTimeString.length;
  let randomDigits = "";
  for (let i = 0; i < remainingDigits; i++) {
    randomDigits += Math.floor(Math.random() * 10);
  }
  const utrNumber = dateTimeString + randomDigits;
  return utrNumber;
}
