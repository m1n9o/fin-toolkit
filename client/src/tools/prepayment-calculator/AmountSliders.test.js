import { clampAmount, defaultAmounts, maxAmount } from './AmountSliders';

test('max amount is the largest whole 10k strictly below principal', () => {
  expect(maxAmount(1000000)).toBe(990000);
  expect(maxAmount(527035.67)).toBe(520000);
});

test('clamp rounds to 10k and stays within range', () => {
  expect(clampAmount(123456, 990000)).toBe(120000);
  expect(clampAmount(0, 990000)).toBe(10000);
  expect(clampAmount(2000000, 990000)).toBe(990000);
});

test('defaults are 10~50 万, or evenly split when principal is small', () => {
  expect(defaultAmounts(1000000)).toEqual([100000, 200000, 300000, 400000, 500000]);
  expect(defaultAmounts(260000)).toEqual([50000, 100000, 150000, 200000, 250000]);
  expect(defaultAmounts(30000)).toEqual([10000, 20000]);
});
