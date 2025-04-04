import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./database";
import { currencyRouter } from "./currency.routes";

// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();

const { ATLAS_URI } = process.env;

if(!ATLAS_URI) {
    console.error("No ATLAS_URI environment has been defined in config.env");
    process.exit(1);
}

connectToDatabase(ATLAS_URI).then(() =>{
    const app = express();
    app.use(cors());

    //start express server
    app.use("/currencies", currencyRouter);

    app.listen(5200, () => {
        console.log(`Server running at http://localhost:5200...`)
    });
})
.catch((error) => console.error(error));