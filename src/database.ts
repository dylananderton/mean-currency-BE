import * as mongodb from "mongodb";
import { Currency } from "./currency";

export const collections: {
    currencies?: mongodb.Collection<Currency>,
} = {};

export async function connectToDatabase(uri: string){
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db("meanStackExample");
    await applySchemaValidation(db);

    const currenciesCollection = db.collection<Currency>("currencies");
    collections.currencies = currenciesCollection;
}

async function applySchemaValidation(db: mongodb.Db){
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["code", "buy", "sell"],
            additionalProperties: false,
            properties: {
                _id: {},
                code: {
                    bsonType: "string",
                    description: "'code' is required and is a string",
                },
                buy: {
                    bsonType: "number",
                    description: "'buy' is required and is a number",
                    min: 0.1
                },
                sell: {
                    bsonType: "number",
                    description: "'sell' is required and is a number",
                    min: 0.1
                },
            },
        },
    };

    await db.command({
        collMod: "currencies",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if(error.codeName === "NamespaceNotFound") {
            await db.createCollection("currencies", {validator: jsonSchema});
        }
    });
}