export function generateRandomEmail(name) {
  const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
  let username = name;
  const domains = ["gmail", "yahoo"];
  const usernameLength = Math.floor(Math.random() * 6) + 5;
  for (let i = 0; i < usernameLength; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}.com`;
}
