export function convertToIST(date) {
  const utcDate = new Date(date.toISOString());
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5.5
  return new Date(utcDate.getTime() + istOffset);
}
