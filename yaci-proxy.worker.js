// Optional HTTPS front for the UZH Cardano indexer so GitHub Pages
// pay-ada.html can call it (browsers block HTTPS page → HTTP Yaci).
//
//   npx wrangler deploy yaci-proxy.worker.js
//
// Then the kiosk QR is:
//   https://benckj.github.io/cryptocoffee-pay/pay-ada.html?addr=…&amount=…&rpc=https://<worker>/api/v1
//
// The coffee Pi is not in this path. Traefik on 130.60.24.200:443 can
// replace this worker if the Cardano TAs add a route to Yaci :8080.

const YACI = "http://130.60.24.200:8080";

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }
    const incoming = new URL(request.url);
    const target = YACI + incoming.pathname + incoming.search;
    const headers = new Headers(request.headers);
    headers.delete("host");
    const init = { method: request.method, headers };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.arrayBuffer();
    }
    const upstream = await fetch(target, init);
    const out = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(cors())) out.set(k, v);
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,project_id",
  };
}
