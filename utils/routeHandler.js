import { serveJSON } from "./serveJSON.js";

export const router = {
  routes: [],

  get(path, handler) {
    this.routes.push({ path, method: "GET", handler });
  },

  put(path, handler) {
    this.routes.push({ path, method: "PUT", handler });
  },

  handle(req, res) {
    const protocol = req.socket.encrypted ? "https" : "http";
    const host = req.headers.host;
    const method = req.method;
    const url = new URL(req.url, `${protocol}://${host}`);
    const pathParts = url.pathname.split("/").filter(Boolean);
    req.params = {};
    if (method === "PUT" || method === "POST") {
      req.body = new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          resolve(body);
        });
        req.on("error", (err) => {
          reject(err);
        });
      });
    }
    for (const route of this.routes) {
      if (route.method === method && isRouteMatch(pathParts, route.path, req)) {
        return route.handler(req, res);
      }
    }

    serveJSON(res, 404, { message: "Not found", path: url.path });
  },
};

function isRouteMatch(input, route, req) {
  const routeParts = route.toLowerCase().split("/").filter(Boolean);
  if (routeParts.length !== input.length) {
    return false;
  }
  for (let i = 0; i < input.length; i++) {
    if (routeParts[i].startsWith(":")) {
      req.params[routeParts[i].slice(1)] = input[i];
    } else if (input[i] !== routeParts[i]) {
      return false;
    }
  }
  return true;
}
