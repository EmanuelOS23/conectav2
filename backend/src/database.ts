import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/conectasus";

export async function connectDB(): Promise<void> {
  mongoose.connection.on("connected",    () => console.log("✅ MongoDB conectado"));
  mongoose.connection.on("error",  (err) => console.error("❌ MongoDB erro:", err));
  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB desconectado"));

  await mongoose.connect(MONGO_URI);
}
