import crypto from "node:crypto";

function generateRandomToken(length) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const token = buffer.toString("hex").slice(0, length);
        resolve(token);
      }
    });
  });
}

generateRandomToken(24) 
  .then((token) => {
    console.log("Random token:", token);
  })
  .catch((err) => {
    console.error("Error generating token:", err);
  });
