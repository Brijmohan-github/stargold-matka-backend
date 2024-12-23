import { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
    },
    // email: {
    //   type: String,
    //   required: [true, "Email is required!"],
    //   lowercase: true,
    //   validate: {
    //     validator: function (value) {
    //       return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
    //     },
    //     message: (props) => `${props.value} is not a valid email!`,
    //   },
    // },
    phone: {
      type: Number,
      required: [true, "Phone is required!"],
      minlength: [10, "Phone must be at least 10 characters long"],
      maxlength: [10, "Phone cannot exceed 10 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
    },
    validuser: {
      type: Boolean,
      default: false,
    },
    money: {
      type: Number,
      default: 0,
    },
    bankName: String,
    ahn: String, //accountholderName
    branch: String, //branch Address
    accountNumber: Number,
    ifsc: String,
    paytmUpi: String,
    googleUpi: String,
    phonepeUpi: String,
    account: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Approved", // Approved, Rejected, Blocked
    },
    // transection: [{ type: Schema.Types.ObjectId, ref: "Transection" }],
    referCode: String,
    senderCode: {
      type: String,
      default: "2KYuafe6",
    },
    show: {
      type: Boolean,
      default: true, // true and false
    },
    normalPassword: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: () => {
        let now = new Date();
        now.setHours(now.getHours() + 5);
        now.setMinutes(now.getMinutes() + 30);
        return now;
      },
    },
  },

);

const user = model("User", userSchema);

export default user;
