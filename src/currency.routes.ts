import * as express from 'express';
import { ObjectId } from 'mongodb';
import { collections } from './database';

export const currencyRouter = express.Router();
currencyRouter.use(express.json());

currencyRouter.get("/", async (_req, res) => {
    try {
        const currencies = await collections?.currencies?.find({}).toArray();
        res.status(200).send(currencies);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

currencyRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id)};
        const currency = await collections?.currencies?.findOne(query);

        if(currency){
            res.status(200).send(currency);
        } else {
            res.status(404).send(`Failed to find a currency: ID ${id}`);
        }
    } catch (error) {
        res.status(400).send(`Failed to find a currency: ID ${req?.params?.id}`);
    }
});

currencyRouter.post("/", async (req, res) => {
    try {
        const currency = req.body;
        const result = await collections?.currencies?.insertOne(currency);

        if(result?.acknowledged) {
            res.status(201).send(`Created a new currency: ID ${result.insertedId}. `);
        } else {
            res.status(500).send("Failed to create a new currency.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
    }
});

currencyRouter.put("/", async (req, res) => {
    try {
        const updates = req.body;

        if(!Array.isArray(updates) || updates.length === 0){
            res.status(400).send("Invalid Request. Expected an array of updates")
        }

        const bulkOperations = updates.map(({ code, buy, sell }: { code: string; buy: number; sell: number }) => ({
            updateOne: {
                filter: { code },
                update: { $set: { buy, sell } },
            },
        }));

        const result = await collections?.currencies?.bulkWrite(bulkOperations);

        if(result){
            res.status(200).json({
                matchedCount: result?.matchedCount ?? 0,
                modifiedCount: result?.modifiedCount ?? 0,
                message: `Updated ${result?.modifiedCount ?? 0} currencies successfully.`,
            })
        }


    } catch (error){
        console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
    }
});


currencyRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const currency = req.body;
        const query = {_id: new ObjectId(id)};
        const result = await collections?.currencies?.updateOne(query, {$set: currency});

        if(result && result.matchedCount) {
            res.status(200).send(`Updated a currency: ID ${id}.`);
        } else if(!result?.matchedCount) {
            res.status(404).send(`Failed to find a currency: ID ${id}.`);
        } else {
            res.status(304).send(`Failed to update a currency: ID ${id}.`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknwn error";
        console.error(message);
        res.status(400).send(message);
    }
});

currencyRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = {_id: new ObjectId(id) };
        const result = await collections?.currencies?.deleteOne(query);

        if(result && result.deletedCount) {
            res.status(202).send(`Removed a currency: ID ${id}.`);
        } else if (!result){
            res.status(400).send(`Failed to remove a currency ID: ${id}.`);
        } else if(!result.deletedCount){
            res.status(404).send(`Failed to find a currency ID: ${id}.`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});