export type ViewportSize = { width: number; height: number };

export type PopupPosition = {
  left: number;
  top: number;
  maxHeight: number;
};

const VIEWPORT_PADDING = 8;
const POPUP_GAP = 4;
const ROOT_MIN_HEIGHT = 200;
const NESTED_WIDTH = 180;

export function getRootPopupPosition(
  trigger: DOMRect,
  viewport: ViewportSize,
): PopupPosition {
  const availableBelow = viewport.height - trigger.top - VIEWPORT_PADDING;
  const top = availableBelow >= ROOT_MIN_HEIGHT ? trigger.top : VIEWPORT_PADDING;

  return {
    left: trigger.right + POPUP_GAP,
    top,
    maxHeight: Math.max(0, viewport.height - top - VIEWPORT_PADDING),
  };
}

export function getNestedPopupPosition(
  trigger: DOMRect,
  viewport: ViewportSize,
): PopupPosition {
  const opensRight = trigger.right + POPUP_GAP + NESTED_WIDTH <=
    viewport.width - VIEWPORT_PADDING;
  const left = opensRight
    ? trigger.right + POPUP_GAP
    : Math.max(VIEWPORT_PADDING, trigger.left - NESTED_WIDTH - POPUP_GAP);
  const availableBelow = viewport.height - trigger.top - VIEWPORT_PADDING;
  const top = availableBelow >= ROOT_MIN_HEIGHT ? trigger.top : VIEWPORT_PADDING;

  return {
    left,
    top,
    maxHeight: Math.max(0, viewport.height - top - VIEWPORT_PADDING),
  };
}
