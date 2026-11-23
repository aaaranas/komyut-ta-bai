import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { erfc, mcnemar, wilcoxonSignedRank, wilsonInterval } from "@/core/evaluation/stats";

const close = (actual: number | null | undefined, expected: number, digits = 3) =>
  assert.ok(actual !== null && actual !== undefined && Math.abs(actual - expected) < 10 ** -digits, `${actual} ≈ ${expected}`);

describe("statistics, hand-calculated", () => {
  it("erfc matches known values", () => {
    close(erfc(0), 1, 6);
    close(erfc(1), 0.157299, 6);
    close(erfc(-1), 1.842701, 6);
  });

  it("Wilson 95% interval: 8 of 10 → [0.490, 0.943]", () => {
    const ci = wilsonInterval(8, 10)!;
    close(ci.lower, 0.4902);
    close(ci.upper, 0.9433);
    assert.equal(wilsonInterval(0, 0), null);
    const zero = wilsonInterval(0, 10)!;
    assert.equal(zero.lower, 0);
    close(zero.upper, 0.2775);
  });

  it("McNemar exact for b + c < 25: b = 1, c = 9 → p = 2·(1 + 10)/1024", () => {
    const result = mcnemar(1, 9);
    assert.equal(result.method, "exact");
    close(result.p, 22 / 1024, 6);
    assert.equal(mcnemar(5, 5).p, 1);
    assert.equal(mcnemar(0, 0).p, null);
  });

  it("McNemar χ² with continuity correction: b = 10, c = 30 → χ² = 9.025, p ≈ 0.00266", () => {
    const result = mcnemar(10, 30);
    assert.equal(result.method, "chi_square");
    close(result.statistic, 9.025, 6);
    close(result.p, 0.002663, 5);
  });

  it("Wilcoxon exact: five positive differences 1..5 → W− = 0, p = 2/32", () => {
    const result = wilcoxonSignedRank([2, 4, 6, 8, 10], [1, 2, 3, 4, 5]);
    assert.equal(result.method, "exact");
    assert.equal(result.w_plus, 15);
    assert.equal(result.w_minus, 0);
    close(result.p, 0.0625, 6);
  });

  it("Wilcoxon drops zero differences and averages tied ranks", () => {
    // d = [0, 1, -1, 2, 2, 3]: zero dropped; |d| ranks 1.5, 1.5, 3.5, 3.5, 5
    const result = wilcoxonSignedRank([5, 6, 4, 7, 7, 8], [5, 5, 5, 5, 5, 5]);
    assert.equal(result.n, 5);
    assert.equal(result.w_plus, 1.5 + 3.5 + 3.5 + 5);
    assert.equal(result.w_minus, 1.5);
    assert.equal(result.method, "normal");
    // mean 7.5, var = 5·6·11/24 − (6 + 6)/48 = 13.5; z = (13.5 − 7.5 − 0.5)/√13.5
    close(result.z, 5.5 / Math.sqrt(13.5), 6);
  });
});
