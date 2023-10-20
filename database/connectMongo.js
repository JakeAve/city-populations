import { MongoClient, ServerApiVersion } from "mongodb";

const URI = process.env.MONGO_CONNECTION;

export const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useNewUrlParser: true,
  },
})

export const db = client.db('city-populations');

export async function connectToDB() {
  try {
    await client.connect();
    await client.db("city-populations").command({ ping: 1 });
  } catch (err) {
    console.error("Could not connect to DB", err);
    process.exit(1);
  }
}
