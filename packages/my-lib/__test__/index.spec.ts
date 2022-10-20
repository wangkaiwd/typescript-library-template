import { describe, it, expect } from "vitest";
import { add } from "../src";

describe("add", () => {
  it("should add two numbers", () => {
    const sum = add(1, 2);
    expect(sum).toBe(3);
  });
});
