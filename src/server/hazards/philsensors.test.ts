import assert from "node:assert/strict";
import { it } from "node:test";
import { philSensorsReadings, philSensorsStatus } from "@/server/hazards/philsensors";

it("PhilSensors is hidden unless enabled, and never claims a connection", async () => {
  delete process.env.KOMYUT_ENABLE_PHILSENSORS;
  assert.equal(philSensorsStatus(), null);
  process.env.KOMYUT_ENABLE_PHILSENSORS = "true";
  assert.equal(philSensorsStatus()?.status, "not_connected");
  process.env.PHILSENSORS_API_KEY = "test-key";
  assert.equal(philSensorsStatus()?.status, "not_connected");
  assert.deepEqual(await philSensorsReadings(), []);
  delete process.env.KOMYUT_ENABLE_PHILSENSORS;
  delete process.env.PHILSENSORS_API_KEY;
});
