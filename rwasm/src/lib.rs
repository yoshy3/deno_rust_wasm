use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[macro_use]
extern crate serde_derive;

#[derive(Serialize, Deserialize)]
pub struct Interval {
  pub outer: Vec<bool>,
  pub inner: Vec<bool>,
}

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
pub fn compute_random(interval_model: &JsValue) -> u32 {
  let interval: Interval = interval_model.into_serde().unwrap();
  let num_rows = interval.outer.len();
  let num_col = interval.inner.len();
  let mut count: u32 = 0;
  for i in 0..num_rows { 
    let randomize_row = interval.outer[i];
    for j in 0..num_col {
      if randomize_row {
        let is_negative = interval.inner[j];
        if is_negative && count > 0 {
          count -= 1;
        } else {
          count += 1;
        }
      } else {
        count += 1;
      }
    }
  }
  count
}