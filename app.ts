import {
  Application,
  Router,
  Request,
  Response,
} from "https://deno.land/x/oak@v6.2.0/mod.ts";

// max javascript number value = 2147483647. so maxRounds < sqrt(2147483647) = 46340.95
const maxRounds = 46340;

// wasm
const wasmCode = await Deno.readFile("./rwasm/pkg/rwasm_bg.wasm");
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule);
const rwasm: any = wasmInstance.exports;

// app
const app = new Application();

// routes
const router = new Router();
router.post("/api", async ({ request, response }: { request: Request, response: Response }) => {
  const result = request.body();
  const body = await result.value;
  if (body == undefined || body.type == undefined || body.rounds == undefined) {
    response.status = 400;
    response.body = { error: "Invalid data" };
    return;
  }

  const type = body.type;
  const rounds = body.rounds;

  if (!(["deno", "rust"].includes(type))) {
    response.status = 400;
    response.body = { error: "Not 'deno' or 'rust'" };
    return;
  }

  if (rounds > maxRounds) {
    response.status = 400;
    response.body = { error: "Parameter 'rounds' is out of bounds" };
    return;
  }

  const scale = 1000000; // nanoseconds
  const start = performance.now() * scale;

  let count = 0;
  if (type == "deno") {
    for (let i = 0; i < rounds; i++) {
      for (let j = 0; j < rounds; j++) {
        count += 1;
      }
    }
  } else {
    count = rwasm.compute(rounds);
  }

  const duration = performance.now() * scale - start;
  response.status = 200;
  response.body = { type, duration, count };
});
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server started @ http://localhost:8000");
await app.listen({ port: 8000 });
