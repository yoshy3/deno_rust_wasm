# deno_rust_wasm
This shows how you can import Rust WASM files into Deno to speed things up greatly.

// Installation

1. Install rust.
a. Go to https://www.rust-lang.org/tools/install.
b. Copy install script.
c. Run script on machine.

2. Install wasm-pack
a. Go to https://rustwasm.github.io/wasm-pack/installer/
b. Copy install script
c. Run on machine

// Build rwasm

1. cd into rwasm directory.
2. Run "wasm-pack buld".

// Run server

1. deno run --allow-net --allow-read app.ts

// Test server

1. Deno: curl -d '{"type":"deno","rounds":46340}' -H 'Content-Type: application/json' http://localhost:8000/api
2. Rust: curl -d '{"type":"rust","rounds":46340}' -H 'Content-Type: application/json' http://localhost:8000/api