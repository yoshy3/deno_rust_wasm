use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn compute(rounds: u32) -> u32 {
  let mut count: u32 = 0;
  for _ in 0..rounds { 
    for _ in 0..rounds {
      count += 1;
    }
  }
  count
}

#[wasm_bindgen]
pub fn compute_pseudo_random_fibonacci_series(negative_sign_interval: u32, n: u32) -> u32 {
  let mut prv_fib_num0 = 0;
  let mut prv_fib_num1 = 1;
  let mut cur_fib_num;
  let mut count: u32 = 0;
  for x in 0..n { 
    cur_fib_num = prv_fib_num0 + prv_fib_num1;
    prv_fib_num0 = prv_fib_num1;
    prv_fib_num1 = cur_fib_num;
    if x + 1 % negative_sign_interval == 0 {
      count -= cur_fib_num;
    } else {
      count += cur_fib_num;
    }
  }
  count
}