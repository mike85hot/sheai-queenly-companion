import { describe, expect, it } from "vitest";
import { whatsappTripUrl } from "@/lib/trip-sharing";

describe("International trip sharing", () => {
  it("shares a live trip through WhatsApp without requiring a saved phone number", () => {
    const url = new URL(whatsappTripUrl("Lagos & home", "https://sheai.live/t/test-token"));
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toBe("I'm on my way to Lagos & home. Follow my trip live: https://sheai.live/t/test-token");
  });
  it("includes a request for help in overdue WhatsApp sharing", () => {
    const url = new URL(whatsappTripUrl("Delhi", "https://sheai.live/t/late-token", true));
    expect(url.searchParams.get("text")).toBe("I haven't arrived at Delhi and may need help. My live location: https://sheai.live/t/late-token");
  });
});