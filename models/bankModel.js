import { Schema, model } from "mongoose";

const bankSchema = new Schema({
  // bankName: { type: String, default: "Default Bank Name" },
  // ahn: { type: String, default: "Account Holder Name" }, // accountholderName
  // account: { type: Number, default: 123456789 }, // Example default account number
  // ifsc: { type: String, default: "IFSC0001234" }, // Example IFSC code
  // paytmUpi: { type: String, default: "example@paytm" },
  // googleUpi: { type: String, default: "example@google" },
  phonepeUpi: { type: String, default: "gskpvtltd@finobank" },
  scanner: { type: String, default: "path/to/default/scanner/image.png" },
  // upi: String,
  key: { type: String, default: "86fddd8a-0c9c-4e69-bdae-d4dc3c30cf93" },
  visible: {
    type: Number,
    default: 2, // 1 for manual payment and 2 for self gateway and 3 for payment gateway
  },
});

const bank = model("Bank", bankSchema);
export default bank;
