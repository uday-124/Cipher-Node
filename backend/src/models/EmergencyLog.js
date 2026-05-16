import mongoose from "mongoose";

const emergencyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    status: {
      type: String,
      default: "triggered",
    },
  },
  { timestamps: true }
);

const EmergencyLog = mongoose.model("EmergencyLog", emergencyLogSchema);

export default EmergencyLog;
