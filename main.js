import http from 'http';
import 'dotenv/config'
import { router } from './routes.js';

const PORT = process.env.PORT || 5555;

const server = http.createServer((req, res) => router.handle(req, res))

// import { connectToDB, db } from './database/connectMongo.js';

// (async () => {
//     await connectToDB();
// })()

server.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`)
})