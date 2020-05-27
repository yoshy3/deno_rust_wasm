
// private
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

function pseudoRandomFibonacciSummation(type: string, n: number, negativeSignInterval: number, rwasm: any): number {
  
}
