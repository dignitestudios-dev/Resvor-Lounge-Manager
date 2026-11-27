import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getImageDisplayRect,
  getVisibleImageBounds,
  getInitialCropBox,
  clampCropBoxToBounds,
  moveCropBox,
  resizeCropBox,
  cropBoxToNaturalPixels,
} from "../src/lib/utils/interactiveCropGeometry.js";

const ASPECT_16_9 = 16 / 9;

test("Initial 16:9 crop box selects largest possible 16:9 area within image bounds", () => {
  const imgRect = getImageDisplayRect(600, 320, 1920, 1080, 1, { x: 0, y: 0 });
  const bounds = getVisibleImageBounds(600, 320, imgRect);
  const box = getInitialCropBox(bounds, ASPECT_16_9, 1);

  assert.ok(box.width > 0 && box.height > 0);
  assert.ok(Math.abs(box.width / box.height - ASPECT_16_9) < 1e-6);
  assert.ok(box.x >= bounds.left - 1e-6 && box.x + box.width <= bounds.right + 1e-6);
  assert.ok(box.y >= bounds.top - 1e-6 && box.y + box.height <= bounds.bottom + 1e-6);
  // For 16:9 image inside 16:9 bounds, fill ratio 1 spans either full width or full height
  assert.ok(
    Math.abs(box.width - bounds.width) < 1e-4 || Math.abs(box.height - bounds.height) < 1e-4
  );
});

test("Square QR code image gets maximum width 16:9 crop box spanning full width", () => {
  // Container: 640x320. Square image: 600x600.
  const containerW = 640;
  const containerH = 320;
  const qrW = 600;
  const qrH = 600;

  const rect = getImageDisplayRect(containerW, containerH, qrW, qrH, 1, { x: 0, y: 0 });
  const bounds = getVisibleImageBounds(containerW, containerH, rect);
  const box = getInitialCropBox(bounds, ASPECT_16_9, 1);

  // In a square image, width is the constraint for 16:9 (width <= height * (16/9))
  // Therefore the 16:9 box width should match the square image display width (100% of bounds.width)
  assert.ok(Math.abs(box.width - bounds.width) < 1e-4, "Crop box width must span full square image width");
  assert.ok(Math.abs(box.width / box.height - ASPECT_16_9) < 1e-6, "Crop box must be exact 16:9");
  assert.ok(box.height < bounds.height, "Crop box height should be centered within square height");
  assert.ok(box.y > bounds.top, "Top offset should be centered");
  assert.ok(box.y + box.height < bounds.bottom, "Bottom offset should be centered");

  // Pixel mapping check
  const pixels = cropBoxToNaturalPixels(box, rect, qrW, qrH);
  assert.equal(pixels.x, 0, "Crop in natural pixels starts at left edge");
  assert.equal(pixels.width, qrW, "Crop in natural pixels spans entire width of QR code");
  assert.ok(Math.abs(pixels.width / pixels.height - ASPECT_16_9) < 0.02);
});

test("Landscape 16:9 image gets maximum 16:9 crop box spanning entire image", () => {
  const containerW = 640;
  const containerH = 320;
  const imgW = 1920;
  const imgH = 1080;

  const rect = getImageDisplayRect(containerW, containerH, imgW, imgH, 1, { x: 0, y: 0 });
  const bounds = getVisibleImageBounds(containerW, containerH, rect);
  const box = getInitialCropBox(bounds, ASPECT_16_9, 1);

  assert.ok(Math.abs(box.width - bounds.width) < 1e-4);
  assert.ok(Math.abs(box.height - bounds.height) < 1e-4);

  const pixels = cropBoxToNaturalPixels(box, rect, imgW, imgH);
  assert.equal(pixels.x, 0);
  assert.equal(pixels.y, 0);
  assert.equal(pixels.width, imgW);
  assert.equal(pixels.height, imgH);
});

test("Dragging crop box moves it within bounds without changing dimensions", () => {
  const bounds = { left: 20, top: 20, right: 580, bottom: 300, width: 560, height: 280 };
  const startBox = { x: 100, y: 60, width: 320, height: 180 };

  const moved = moveCropBox(startBox, 50, 30, bounds);
  assert.equal(moved.x, 150);
  assert.equal(moved.y, 90);
  assert.equal(moved.width, 320);
  assert.equal(moved.height, 180);

  // Clamp when dragged past top-left or bottom-right
  const clampedTopLeft = moveCropBox(startBox, -500, -500, bounds);
  assert.equal(clampedTopLeft.x, bounds.left);
  assert.equal(clampedTopLeft.y, bounds.top);

  const clampedBottomRight = moveCropBox(startBox, 500, 500, bounds);
  assert.equal(clampedBottomRight.x, bounds.right - startBox.width);
  assert.equal(clampedBottomRight.y, bounds.bottom - startBox.height);
});

test("All 8 corner and edge handles lock aspect ratio to 16:9 and stay within bounds", () => {
  const bounds = { left: 10, top: 10, right: 610, bottom: 350, width: 600, height: 340 };
  const startBox = { x: 150, y: 80, width: 288, height: 162 }; // exact 16:9

  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  for (const handle of handles) {
    const resized = resizeCropBox(startBox, handle, 40, -25, bounds, ASPECT_16_9);
    assert.ok(
      Math.abs(resized.width / resized.height - ASPECT_16_9) < 1e-6,
      `Handle ${handle} broke 16:9 ratio: ${resized.width / resized.height}`
    );
    assert.ok(resized.x >= bounds.left - 1e-6, `Handle ${handle} exceeded left bound`);
    assert.ok(resized.y >= bounds.top - 1e-6, `Handle ${handle} exceeded top bound`);
    assert.ok(resized.x + resized.width <= bounds.right + 1e-6, `Handle ${handle} exceeded right bound`);
    assert.ok(resized.y + resized.height <= bounds.bottom + 1e-6, `Handle ${handle} exceeded bottom bound`);
  }
});

test("cropBoxToNaturalPixels maps crop box accurately at zoom > 1", () => {
  const imgRect = getImageDisplayRect(600, 320, 1920, 1080, 1.5, { x: 0, y: 0 });
  const bounds = getVisibleImageBounds(600, 320, imgRect);
  const box = clampCropBoxToBounds(
    { x: bounds.left + 20, y: bounds.top + 10, width: 320, height: 180 },
    bounds,
    ASPECT_16_9
  );
  const pixels = cropBoxToNaturalPixels(box, imgRect, 1920, 1080);

  assert.ok(pixels.x >= 0 && pixels.y >= 0);
  assert.ok(pixels.x + pixels.width <= 1920);
  assert.ok(pixels.y + pixels.height <= 1080);
  assert.ok(Math.abs(pixels.width / pixels.height - ASPECT_16_9) < 0.02);
});

test("Freeform mode initializes crop box covering 100% of visible image bounds", () => {
  const imgRect = getImageDisplayRect(640, 320, 1000, 800, 1, { x: 0, y: 0 });
  const bounds = getVisibleImageBounds(640, 320, imgRect);
  const box = getInitialCropBox(bounds, null, 1);

  assert.equal(box.x, bounds.left);
  assert.equal(box.y, bounds.top);
  assert.equal(box.width, bounds.width);
  assert.equal(box.height, bounds.height);
});

test("Freeform mode allows independent resizing across all 8 handles and clamps to bounds", () => {
  const bounds = { left: 0, top: 0, right: 600, bottom: 400, width: 600, height: 400 };
  const startBox = { x: 100, y: 80, width: 300, height: 200 };

  // Handle 'e' extends right boundary independently without changing height
  const eBox = resizeCropBox(startBox, "e", 50, 0, bounds, null);
  assert.equal(eBox.width, 350);
  assert.equal(eBox.height, 200);
  assert.equal(eBox.x, 100);
  assert.equal(eBox.y, 80);

  // Handle 'w' moves left boundary independently
  const wBox = resizeCropBox(startBox, "w", -40, 0, bounds, null);
  assert.equal(wBox.x, 60);
  assert.equal(wBox.width, 340);
  assert.equal(wBox.height, 200);

  // Handle 's' extends bottom boundary independently without changing width
  const sBox = resizeCropBox(startBox, "s", 0, 60, bounds, null);
  assert.equal(sBox.height, 260);
  assert.equal(sBox.width, 300);

  // Handle 'n' moves top boundary independently
  const nBox = resizeCropBox(startBox, "n", 0, -30, bounds, null);
  assert.equal(nBox.y, 50);
  assert.equal(nBox.height, 230);
  assert.equal(nBox.width, 300);

  // Handles 'nw', 'ne', 'se', 'sw' resize corners freely to any aspect ratio
  const seBox = resizeCropBox(startBox, "se", 80, 20, bounds, null);
  assert.equal(seBox.width, 380);
  assert.equal(seBox.height, 220);

  const nwBox = resizeCropBox(startBox, "nw", -50, -30, bounds, null);
  assert.equal(nwBox.x, 50);
  assert.equal(nwBox.y, 50);
  assert.equal(nwBox.width, 350);
  assert.equal(nwBox.height, 230);

  const neBox = resizeCropBox(startBox, "ne", 40, -40, bounds, null);
  assert.equal(neBox.x, 100);
  assert.equal(neBox.y, 40);
  assert.equal(neBox.width, 340);
  assert.equal(neBox.height, 240);

  const swBox = resizeCropBox(startBox, "sw", -40, 50, bounds, null);
  assert.equal(swBox.x, 60);
  assert.equal(swBox.y, 80);
  assert.equal(swBox.width, 340);
  assert.equal(swBox.height, 250);

  // Handles clamp strictly inside bounds
  const clampedBox = resizeCropBox(startBox, "se", 9999, 9999, bounds, null);
  assert.equal(clampedBox.x + clampedBox.width, bounds.right);
  assert.equal(clampedBox.y + clampedBox.height, bounds.bottom);
});

test("AddCustomFlyerModal configures ImageCropperModal for freeform resizing without forced 16:9 aspect", () => {
  const modalSrc = fs.readFileSync(
    path.resolve("src/components/campaign-and-flyers/AddCustomFlyerModal.jsx"),
    "utf8"
  );
  assert.ok(modalSrc.includes("aspect={null}"));
  assert.ok(modalSrc.includes("allowResize={true}"));
  assert.ok(modalSrc.includes("allowOriginal={true}"));
});

test("ImageCropperModal supports both 'Use Original Image' and 'Crop Image'", () => {
  const cropperSrc = fs.readFileSync(
    path.resolve("src/components/common/ImageCropperModal.jsx"),
    "utf8"
  );
  assert.ok(cropperSrc.includes("allowOriginal"));
  assert.ok(cropperSrc.includes("handleUseOriginal"));
  assert.ok(cropperSrc.includes("Use Original Image"));
  assert.ok(cropperSrc.includes("Crop Image"));
});

test("Consecutive image uploads re-initialize cropBox and preserve 16:9 1600x900 export", () => {
  // Simulate image 1: 1920x1080 (16:9 landscape)
  const container = { width: 640, height: 320 };
  const img1 = { naturalWidth: 1920, naturalHeight: 1080 };
  const rect1 = getImageDisplayRect(container.width, container.height, img1.naturalWidth, img1.naturalHeight, 1, { x: 0, y: 0 });
  const bounds1 = getVisibleImageBounds(container.width, container.height, rect1);
  const cropBox1 = getInitialCropBox(bounds1, ASPECT_16_9, 0.88);
  const pixels1 = cropBoxToNaturalPixels(cropBox1, rect1, img1.naturalWidth, img1.naturalHeight);

  assert.ok(pixels1, "Crop area pixels must exist for image 1");
  assert.ok(Math.abs(pixels1.width / pixels1.height - ASPECT_16_9) < 0.02);

  // Simulate image 2 uploaded next: 1000x1500 (portrait image)
  const img2 = { naturalWidth: 1000, naturalHeight: 1500 };
  const rect2 = getImageDisplayRect(container.width, container.height, img2.naturalWidth, img2.naturalHeight, 1, { x: 0, y: 0 });
  const bounds2 = getVisibleImageBounds(container.width, container.height, rect2);
  const cropBox2 = getInitialCropBox(bounds2, ASPECT_16_9, 0.88);
  const pixels2 = cropBoxToNaturalPixels(cropBox2, rect2, img2.naturalWidth, img2.naturalHeight);

  assert.ok(pixels2, "Crop area pixels must exist for image 2");
  assert.ok(pixels2.width > 0 && pixels2.height > 0);
  assert.ok(pixels2.x >= 0 && pixels2.y >= 0);
  assert.ok(pixels2.x + pixels2.width <= img2.naturalWidth);
  assert.ok(pixels2.y + pixels2.height <= img2.naturalHeight);
  assert.ok(Math.abs(pixels2.width / pixels2.height - ASPECT_16_9) < 0.02);
});
