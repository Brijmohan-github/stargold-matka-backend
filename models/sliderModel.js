import { Schema, model } from "mongoose";
const sliderSchema = new Schema({
  image: Array,
});
const slider = model("Slider", sliderSchema);
export default slider;
