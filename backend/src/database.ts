import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export async function connectDB(): Promise<void> {
  if (!MONGO_URI) {
    throw new Error("A variável de ambiente MONGO_URI não foi definida no arquivo .env.");
  }

  mongoose.connection.on("connected",    () => console.log("✅ MongoDB conectado"));
  mongoose.connection.on("error",  (err) => console.error("❌ MongoDB erro:", err));
  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB desconectado"));

  await mongoose.connect(MONGO_URI);
}
