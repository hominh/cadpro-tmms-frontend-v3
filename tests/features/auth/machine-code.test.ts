import { describe, expect, it, vi } from "vitest";
import { getMachineCode } from "@/features/auth/machine-code";

vi.mock("@fingerprintjs/fingerprintjs", () => ({
  default: { load: vi.fn().mockResolvedValue({ get: vi.fn().mockResolvedValue({ visitorId: "visitor-123" }) }) },
}));

describe("getMachineCode", () => {
  it("returns FingerprintJS visitorId", async () => {
    await expect(getMachineCode()).resolves.toBe("visitor-123");
  });
});
