import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  subscription: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
