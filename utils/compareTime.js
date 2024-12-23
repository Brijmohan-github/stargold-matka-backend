export function compareTime(givenTime) {
  const [givenHours, givenMinutes] = givenTime.split(":").map(Number);
  const now = new Date();
  const givenDateTime = new Date();
  givenDateTime.setHours(givenHours, givenMinutes, 0, 0);
  return now > givenDateTime;
}
