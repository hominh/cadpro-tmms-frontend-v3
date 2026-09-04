import { describe, expect, it } from "vitest";
import {
  getNestedPopupPosition,
  getRootPopupPosition,
} from "@/components/layout/sidebar-popup-position";

const rect = (values: Partial<DOMRect>): DOMRect =>
  ({
    x: 0,
    y: 0,
    width: 48,
    height: 34,
    top: 0,
    right: 48,
    bottom: 34,
    left: 0,
    toJSON: () => ({}),
    ...values,
  }) as DOMRect;

describe("sidebar popup positioning", () => {
  it("anchors the root panel after the rail and constrains it at the viewport bottom", () => {
    expect(
      getRootPopupPosition(rect({ top: 730, right: 48 }), {
        width: 1280,
        height: 768,
      }),
    ).toEqual({ left: 52, top: 8, maxHeight: 752 });
  });

  it("keeps a root panel aligned with its trigger when space is available", () => {
    expect(
      getRootPopupPosition(rect({ top: 120, right: 48 }), {
        width: 1280,
        height: 768,
      }),
    ).toEqual({ left: 52, top: 120, maxHeight: 640 });
  });

  it("opens a nested panel rightward and flips left near the viewport edge", () => {
    expect(
      getNestedPopupPosition(rect({ left: 252, right: 452, top: 100 }), {
        width: 900,
        height: 700,
      }),
    ).toMatchObject({ left: 456, top: 100 });

    expect(
      getNestedPopupPosition(rect({ left: 690, right: 890, top: 660 }), {
        width: 900,
        height: 700,
      }),
    ).toEqual({ left: 506, top: 8, maxHeight: 684 });
  });
});
