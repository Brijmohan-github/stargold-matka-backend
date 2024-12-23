export default function CurrentTime() {
  const nowUTC = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const now = new Date(nowUTC.getTime() + offset);
  const startOfToday = new Date(nowUTC.setHours(0, 0, 0, 0) + offset);
  return { now, startOfToday };
}

console.log(CurrentTime())