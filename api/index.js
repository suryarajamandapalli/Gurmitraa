import server from "../dist/server/server.js";

export default {
  async fetch(request, env, ctx) {
    return server.fetch(request, env, ctx);
  }
};
