export interface P {
  a: number;
  b: number;
}

const p: P = { a: 1, b: 2 };
console.log("p", p);

export function add(a: number, b: number) {
  console.log("1", a, b);
  return a + b;
}
