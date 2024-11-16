import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(`mongodb+srv://finalproject:user123@cluster0.fjs9i.mongodb.net/finalproject`).then(() => console.log("DB Connected"));
};
