import { describe, expect, it } from "vitest";
import { MENU_ITEMS } from "@/components/layout/menu-items";
import {
  createInitialExpandedState,
  findActiveAncestorKeys,
  isMenuItemActive,
  mergeExpandedStateForPath,
} from "@/components/layout/menu-route-state";

describe("menu route state", () => {
  it("matches exact and nested detail paths recursively", () => {
    const trace = MENU_ITEMS.find((item) => item.key === "trace")!;
    expect(isMenuItemActive(trace, "/nvaevents/42/camera-a")).toBe(true);
    expect(isMenuItemActive(trace, "/violation")).toBe(false);
  });

  it("opens legacy defaults and keeps Monitor closed", () => {
    const state = createInitialExpandedState(MENU_ITEMS, "/dashboard");
    expect(state.trace).toBe(true);
    expect(state.system).toBe(true);
    expect(state.monitor).toBe(false);
  });

  it("forces active ancestors open while preserving unrelated manual state", () => {
    expect(findActiveAncestorKeys(MENU_ITEMS, "/image-monitor")).toEqual(["monitor"]);
    const state = mergeExpandedStateForPath(
      { monitor: false, trace: false, system: true },
      MENU_ITEMS,
      "/image-monitor/42",
    );
    expect(state).toMatchObject({ monitor: true, trace: false, system: true });
  });
});
