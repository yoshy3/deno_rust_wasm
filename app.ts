import {
  Application,
  Router,
  Request,
  Response,
} from "https://deno.land/x/oak/mod.ts";

// max javascript number value = 2147483647. so maxRounds < sqrt(2147483647) = 46340.95
const maxRounds = 46340;

// wasm
const wasmCode = await Deno.readFile("./rwasm/pkg/rwasm_bg.wasm");
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule);
const rwasm = wasmInstance.exports;

// app
const app = new Application();

// routes
const router = new Router();
router.post("/api", async (ctx: { request: Request; response: Response }) => {
  const body = await ctx.request.body();
  if (
    body == undefined || body.value.type == undefined ||
    body.value.rounds == undefined
  ) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid data" };
    return;
  }

  const type = body.value.type;
  const rounds = body.value.rounds;

  if (!(["deno", "rust"].includes(type))) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Not 'deno' or 'rust'" };
    return;
  }

  if (rounds > maxRounds) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Parameter 'rounds' is out of bounds" };
    return;
  }

  const scale = 1000000; // nanoseconds
  const start = performance.now() * scale;

  // nest loop
  const count = nestedLoopSummation(type, rounds, rwasm);

  const duration = performance.now() * scale - start;

  ctx.response.status = 200;
  ctx.response.body = { type, duration, count };
});
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server started @ http://localhost:8000");
await app.listen({ port: 8000 });

function nestedLoopSummation(type: string, n: number, rwasm: any): number {
  let count = 0;
  if (type == "deno") {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        count += 1;
      }
    }
  } else {
    count = rwasm.compute(n);
  }
  return count;
}
