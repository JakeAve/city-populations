import http from "node:http";
import "dotenv/config";
import { router } from "./routes.js";
import { cache } from "./utils/cache.js";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";

const PORT = process.env.PORT || 5555;

const cpus = availableParallelism();

if (cluster.isPrimary) {
  const sharedRouteCache = cache();
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on("message", (_worker, message) => {
    switch (message.type) {
      case "add-route":
        sharedRouteCache.set(message.route, message.response);
        for (const worker of Object.values(cluster.workers)) {
          worker.send({
            type: "route-added",
            route: message.route,
            response: message.response,
          });
        }
        break;
      default:
        break;
    }
  });
  cluster.on("exit", (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  process.routeCache = cache();
  process.on("message", (message) => {
    switch (message.type) {
      case "route-added":
        process.routeCache.set(message.route, message.response);
        break;
      default:
        break;
    }
  });

  const server = http.createServer((req, res) => {
    router.handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
}
