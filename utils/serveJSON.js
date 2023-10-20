export function serveJSON(res, status = 200, data = {}) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data))
}

