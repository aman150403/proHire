import { app } from './app.js';
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
})

import { connectDB } from './db/index.js';

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, (() => console.log('Server started !!')))
})
.catch((err) => {
    console.log('Mongodb cannot be connected :', err); 
})