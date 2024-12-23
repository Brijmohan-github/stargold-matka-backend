import { Schema, model } from "mongoose";

const enquirySchema = new Schema({
  name: String,
  phone: String,
  message: String,
  email: String,
});

const Enquiry = model("Enquiry", enquirySchema);
export default Enquiry;
