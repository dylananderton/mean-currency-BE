import * as mongodb from "mongodb";

export interface Currency {
    code: string;
    buy: number;
    sell: number;
    _id?: mongodb.ObjectId;
}