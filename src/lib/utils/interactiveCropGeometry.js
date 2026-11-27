/**
 * Geometry helpers for interactive aspect-locked draggable/resizable crop boxes.
 */

export const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

/**
 * Computes the displayed image rect inside the container at a given zoom and pan.
 */
export function getImageDisplayRect(containerW, containerH, imgW, imgH, zoom = 1, pan = { x: 0, y: 0 }, padding = 12) {
  if (!containerW || !containerH || !imgW || !imgH) {
    return { left: 0, top: 0, width: 0, height: 0, scale0: 1, totalScale: 1 };
  }
  const availW = Math.max(1, containerW - padding * 2);
  const availH = Math.max(1, containerH - padding * 2);
  const scale0 = Math.min(availW / imgW, availH / imgH);
  const totalScale = scale0 * zoom;
  const width = imgW * totalScale;
  const height = imgH * totalScale;
  const left = (containerW - width) / 2 + (pan?.x || 0);
  const top = (containerH - height) / 2 + (pan?.y || 0);

  return { left, top, width, height, scale0, totalScale };
}

/**
 * Returns the valid area inside both the container and the displayed image.
 */
export function getVisibleImageBounds(containerW, containerH, imgRect) {
  const left = Math.max(0, imgRect.left);
  const top = Math.max(0, imgRect.top);
  const right = Math.min(containerW, imgRect.left + imgRect.width);
  const bottom = Math.min(containerH, imgRect.top + imgRect.height);
  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

/**
 * Computes the initial crop box inside bounds.
 * If aspect is null/false/'free', selects the ENTIRE visible image bounds (100% width and height).
 * Otherwise clamps to the requested aspect ratio.
 */
export function getInitialCropBox(bounds, aspect = null, fillRatio = 1) {
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  if (!aspect || aspect === "free") {
    return {
      x: bounds.left,
      y: bounds.top,
      width: bounds.width,
      height: bounds.height,
    };
  }

  const ratio = clamp(fillRatio, 0.1, 1);
  const maxW = bounds.width * ratio;
  const maxH = bounds.height * ratio;
  let width = maxW;
  let height = width / aspect;

  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }

  return {
    x: bounds.left + (bounds.width - width) / 2,
    y: bounds.top + (bounds.height - height) / 2,
    width,
    height,
  };
}

/**
 * Clamps a crop box within bounds.
 * If aspect is null/false/'free', allows freeform width and height clamping.
 */
export function clampCropBoxToBounds(box, bounds, aspect = null, minWidth = 24, minHeight = 24) {
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return box;

  if (!aspect || aspect === "free") {
    const width = clamp(box.width, Math.min(minWidth, bounds.width), bounds.width);
    const height = clamp(box.height, Math.min(minHeight, bounds.height), bounds.height);
    const x = clamp(box.x, bounds.left, Math.max(bounds.left, bounds.right - width));
    const y = clamp(box.y, bounds.top, Math.max(bounds.top, bounds.bottom - height));
    return { x, y, width, height };
  }

  const maxW = Math.min(bounds.width, bounds.height * aspect);
  const effectiveMinW = Math.min(minWidth, maxW);
  const width = clamp(box.width, effectiveMinW, maxW);
  const height = width / aspect;

  const x = clamp(box.x, bounds.left, Math.max(bounds.left, bounds.right - width));
  const y = clamp(box.y, bounds.top, Math.max(bounds.top, bounds.bottom - height));

  return { x, y, width, height };
}

/**
 * Moves a crop box by (dx, dy) clamped to bounds.
 */
export function moveCropBox(startBox, dx, dy, bounds) {
  const x = clamp(startBox.x + dx, bounds.left, Math.max(bounds.left, bounds.right - startBox.width));
  const y = clamp(startBox.y + dy, bounds.top, Math.max(bounds.top, bounds.bottom - startBox.height));
  return { ...startBox, x, y };
}

/**
 * Resizes a crop box from any of the 8 handles ('nw','n','ne','e','se','s','sw','w').
 * If aspect is null/false/'free', provides fully independent freeform handle manipulation clamped to image bounds.
 */
export function resizeCropBox(startBox, handle, dx, dy, bounds, aspect = null, minSize = 24) {
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return startBox;

  // Freeform mode: each handle directly controls the corresponding boundary
  if (!aspect || aspect === "free") {
    let { x, y, width, height } = startBox;
    let right = x + width;
    let bottom = y + height;

    const minW = Math.min(minSize, bounds.width);
    const minH = Math.min(minSize, bounds.height);

    if (handle.includes("e")) {
      const desiredRight = clamp(right + dx, x + minW, bounds.right);
      width = desiredRight - x;
    }
    if (handle.includes("w")) {
      const desiredLeft = clamp(x + dx, bounds.left, right - minW);
      width = right - desiredLeft;
      x = desiredLeft;
    }
    if (handle.includes("s")) {
      const desiredBottom = clamp(bottom + dy, y + minH, bounds.bottom);
      height = desiredBottom - y;
    }
    if (handle.includes("n")) {
      const desiredTop = clamp(y + dy, bounds.top, bottom - minH);
      height = bottom - desiredTop;
      y = desiredTop;
    }

    return { x, y, width, height };
  }

  // Aspect-locked mode (for backwards compatibility if an aspect ratio is provided)
  const minW = Math.min(minSize, bounds.width, bounds.height * aspect);
  const minH = minW / aspect;

  const rightEdge = startBox.x + startBox.width;
  const bottomEdge = startBox.y + startBox.height;
  const cx = startBox.x + startBox.width / 2;
  const cy = startBox.y + startBox.height / 2;

  let width = startBox.width;
  let height = startBox.height;
  let x = startBox.x;
  let y = startBox.y;

  switch (handle) {
    case "se": {
      const maxW = Math.min(bounds.right - startBox.x, (bounds.bottom - startBox.y) * aspect);
      const desiredW = Math.abs(dx) >= Math.abs(dy * aspect) ? startBox.width + dx : (startBox.height + dy) * aspect;
      width = clamp(desiredW, minW, Math.max(minW, maxW));
      height = width / aspect;
      x = startBox.x;
      y = startBox.y;
      break;
    }
    case "nw": {
      const maxW = Math.min(rightEdge - bounds.left, (bottomEdge - bounds.top) * aspect);
      const desiredW = Math.abs(dx) >= Math.abs(dy * aspect) ? startBox.width - dx : (startBox.height - dy) * aspect;
      width = clamp(desiredW, minW, Math.max(minW, maxW));
      height = width / aspect;
      x = rightEdge - width;
      y = bottomEdge - height;
      break;
    }
    case "ne": {
      const maxW = Math.min(bounds.right - startBox.x, (bottomEdge - bounds.top) * aspect);
      const desiredW = Math.abs(dx) >= Math.abs(dy * aspect) ? startBox.width + dx : (startBox.height - dy) * aspect;
      width = clamp(desiredW, minW, Math.max(minW, maxW));
      height = width / aspect;
      x = startBox.x;
      y = bottomEdge - height;
      break;
    }
    case "sw": {
      const maxW = Math.min(rightEdge - bounds.left, (bounds.bottom - startBox.y) * aspect);
      const desiredW = Math.abs(dx) >= Math.abs(dy * aspect) ? startBox.width - dx : (startBox.height + dy) * aspect;
      width = clamp(desiredW, minW, Math.max(minW, maxW));
      height = width / aspect;
      x = rightEdge - width;
      y = startBox.y;
      break;
    }
    case "e": {
      const maxHalfH = Math.min(cy - bounds.top, bounds.bottom - cy);
      const maxW = Math.min(bounds.right - startBox.x, maxHalfH * 2 * aspect);
      width = clamp(startBox.width + dx, minW, Math.max(minW, maxW));
      height = width / aspect;
      x = startBox.x;
      y = cy - height / 2;
      break;
    }
    case "w": {
      const maxHalfH = Math.min(cy - bounds.top, bounds.bottom - cy);
      const maxW = Math.min(rightEdge - bounds.left, maxHalfH * 2 * aspect);
      width = clamp(startBox.width - dx, minW, Math.max(minW, maxW));
      height = width / aspect;
      x = rightEdge - width;
      y = cy - height / 2;
      break;
    }
    case "s": {
      const maxHalfW = Math.min(cx - bounds.left, bounds.right - cx);
      const maxH = Math.min(bounds.bottom - startBox.y, (maxHalfW * 2) / aspect);
      height = clamp(startBox.height + dy, minH, Math.max(minH, maxH));
      width = height * aspect;
      x = cx - width / 2;
      y = startBox.y;
      break;
    }
    case "n": {
      const maxHalfW = Math.min(cx - bounds.left, bounds.right - cx);
      const maxH = Math.min(bottomEdge - bounds.top, (maxHalfW * 2) / aspect);
      height = clamp(startBox.height - dy, minH, Math.max(minH, maxH));
      width = height * aspect;
      x = cx - width / 2;
      y = bottomEdge - height;
      break;
    }
    default:
      break;
  }

  return { x, y, width, height };
}

/**
 * Converts a screen-space crop box + image display rect into natural image pixel coordinates.
 */
export function cropBoxToNaturalPixels(box, imgRect, naturalW, naturalH) {
  if (!imgRect?.totalScale || !box?.width || !box?.height) return null;
  const x = clamp(Math.round((box.x - imgRect.left) / imgRect.totalScale), 0, Math.max(0, naturalW - 1));
  const y = clamp(Math.round((box.y - imgRect.top) / imgRect.totalScale), 0, Math.max(0, naturalH - 1));
  const width = clamp(Math.round(box.width / imgRect.totalScale), 1, Math.max(1, naturalW - x));
  const height = clamp(Math.round(box.height / imgRect.totalScale), 1, Math.max(1, naturalH - y));
  return { x, y, width, height };
}
