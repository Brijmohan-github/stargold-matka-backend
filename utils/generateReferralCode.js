export function generateRandomString(length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const timestamp = new Date().getTime().toString();
  const seed = timestamp.substring(timestamp.length - 8);
  let randomString = "";

  for (let i = 0; i < 2; i++) {
    const randomIndex = Math.floor(Math.random() * 26);
    randomString += characters.charAt(randomIndex + 26);
  }
  for (let i = 0; i < 2; i++) {
    const randomIndex = Math.floor(Math.random() * 26);
    randomString += characters.charAt(randomIndex);
  }
  for (let i = 0; i < 2; i++) {
    const randomIndex = Math.floor(Math.random() * 10) + 52;
    randomString += characters.charAt(randomIndex);
  }
  for (let i = 0; i < length - 6; i++) {
    const randomIndex = parseInt(seed[i]) % characters.length;
    randomString += characters.charAt(randomIndex);
  }
  randomString = randomString
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
  return randomString;
}
