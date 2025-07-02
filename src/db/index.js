import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log('Mongodb connected successfully !!')
    } catch (error) {
        console.log('Mongodb connection failed', error);
        process.exit(1);
    }
}

export { connectDB };