import {
  Application,
  Router,
  Request,
  Response,
} from "https://deno.land/x/oak/mod.ts";

// max javascript number value = 2147483647. so maxNumLoops < sqrt(2147483647) = 46340.95
const maxNumLoops = 46340;

// wasm
const wasmCode = await Deno.readFile("./rwasm/pkg/rwasm_bg.wasm");
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule);
const rwasm = wasmInstance.exports;

// app
const app = new Application();

// routes
const router = new Router();
router
  .post("/api/nested", async (ctx: { request: Request; response: Response }) => {
    const body = await ctx.request.body();
    if (body == undefined || body.value.type == undefined || body.value.n == undefined) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid data" };
      return;
    }

    const type = body.value.type;
    const n = body.value.n;

    if (!(["deno", "rust"].includes(type))) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Not 'deno' or 'rust'" };
      return;
    }

    if (n > maxNumLoops) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Parameter 'n' is out of bounds" };
      return;
    }

    const scale = 1000000; // nanoseconds
    const start = performance.now() * scale;
    // nest loop
    const count = nestedLoopSummation(type, n, rwasm);
    const duration = performance.now() * scale - start;

    ctx.response.status = 200;
    ctx.response.body = { type, duration, count };
  })
  .post("/api/random", async ({ request, response }: { request: Request; response: Response }) => {
    const data = await request.body();
    if (data == undefined || data.value.n == undefined) {
      response.status = 400;
      response.body = { error: "Invalid data" };
      return;
    }

    const n = data.value.n;

    if (n > maxNumLoops) {
      response.status = 400;
      response.body = { error: "Parameter 'n' is out of bounds" };
      return;
    }

    const body = randomSummation(n, rwasm);
    response.status = 200;
    response.body = body;
  });
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server started @ http://localhost:8000");
await app.listen({ port: 8000 });

function randomSummation(n: number, rwasm: any): any {
  const scale = 1000000; // nanoseconds
  // deno
  let count = 0;
  let start = performance.now() * scale;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      count += 1;
    }
  }
  let duration = performance.now() * scale - start;
  const deno = { type: 'deno', count, duration };

  // rust
  //   count = rwasm.compute_random(n, negativeSignInterval);
  const rust = { type: 'rust', count, duration };
  return { deno, rust };
}

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
