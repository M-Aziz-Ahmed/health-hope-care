import { mongoose } from 'mongoose';
const uri = "mongodb+srv://azizahmedreal_db_user:MWOHrowJn2IdWHff@hhc.zpdt8hp.mongodb.net/?retryWrites=true&w=majority&appName=HHC";


export async function connectDB() {
  await mongoose.connect(uri);
}
