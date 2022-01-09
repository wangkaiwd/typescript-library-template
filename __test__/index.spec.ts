import { add } from '../lib';

describe('add', () => {
  it('should add two numbers', () => {
    const sum = add(1, 2);
    expect(sum).toBe(3);
  });
});
