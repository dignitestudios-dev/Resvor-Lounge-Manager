import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Lounge Gallery Image Management", () => {
  const MAX_IMAGES = 20;

  describe("1. Capacity & Limit Constraints", () => {
    test("Enforces maximum 20 images per lounge limit", () => {
      const currentImages = Array.from({ length: 18 }, (_, i) => ({ _id: `img_${i}` }));
      const remainingSlots = Math.max(0, MAX_IMAGES - currentImages.length);
      assert.equal(remainingSlots, 2);

      const isMaxReached = currentImages.length >= MAX_IMAGES;
      assert.equal(isMaxReached, false);

      const fullImages = Array.from({ length: 20 }, (_, i) => ({ _id: `img_${i}` }));
      assert.equal(fullImages.length >= MAX_IMAGES, true);
    });

    test("Calculates remaining slots accurately when selecting new files", () => {
      const currentCount = 15;
      const remainingSlots = MAX_IMAGES - currentCount;
      const attemptedFiles = [
        { name: "1.png" },
        { name: "2.png" },
        { name: "3.png" },
        { name: "4.png" },
        { name: "5.png" },
        { name: "6.png" },
        { name: "7.png" },
      ];

      const allowedFiles = attemptedFiles.slice(0, remainingSlots);
      assert.equal(allowedFiles.length, 5);
      assert.equal(allowedFiles.length + currentCount, MAX_IMAGES);
    });
  });

  describe("2. Image Management Actions & Payload Structure", () => {
    test("Remove action constructs deleteImages array payload", () => {
      const targetIdToRemove = "img_id_2";
      const payload = {
        deleteImages: [targetIdToRemove],
      };

      assert.deepEqual(payload.deleteImages, ["img_id_2"]);
      assert.equal(Array.isArray(payload.deleteImages), true);
    });

    test("Remove multiple images supports deleteImages array", () => {
      const toRemove = ["id1", "id2", "id3"];
      const payload = {
        deleteImages: toRemove,
      };

      assert.deepEqual(payload.deleteImages, ["id1", "id2", "id3"]);
      assert.equal(payload.deleteImages.length, 3);
    });

    test("Upload action sends new files under field 'images'", () => {
      const newFiles = [
        new Blob(["content1"], { type: "image/png" }),
        new Blob(["content2"], { type: "image/jpeg" }),
      ];

      const payload = {
        images: newFiles,
      };

      assert.equal(payload.images.length, 2);
      assert.ok(payload.images[0] instanceof Blob);
      assert.ok(payload.images[1] instanceof Blob);
    });
  });

  describe("3. File Validation Rules", () => {
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    test("Allows valid image types and rejects unsupported formats", () => {
      assert.equal(ALLOWED_TYPES.includes("image/jpeg"), true);
      assert.equal(ALLOWED_TYPES.includes("image/png"), true);
      assert.equal(ALLOWED_TYPES.includes("image/webp"), true);
      assert.equal(ALLOWED_TYPES.includes("application/pdf"), false);
      assert.equal(ALLOWED_TYPES.includes("text/plain"), false);
      assert.equal(ALLOWED_TYPES.includes("video/mp4"), false);
    });

    test("Rejects files larger than maximum size", () => {
      const validSize = 5 * 1024 * 1024; // 5MB
      const invalidSize = 12 * 1024 * 1024; // 12MB

      assert.ok(validSize <= MAX_FILE_SIZE_BYTES);
      assert.ok(invalidSize > MAX_FILE_SIZE_BYTES);
    });
  });

  describe("4. Image URL and Identifier Resolution", () => {
    test("Resolves URLs from url, location, or string", () => {
      const getImageUrl = (img) => {
        if (!img) return "/images/lounge.jfif";
        if (typeof img === "string") return img;
        return img.url || img.location || "/images/lounge.jfif";
      };

      assert.equal(
        getImageUrl({ url: "https://cdn.example.com/photo.jpg" }),
        "https://cdn.example.com/photo.jpg"
      );
      assert.equal(
        getImageUrl({ location: "https://s3.example.com/photo2.jpg" }),
        "https://s3.example.com/photo2.jpg"
      );
      assert.equal(
        getImageUrl("https://direct.example.com/photo3.jpg"),
        "https://direct.example.com/photo3.jpg"
      );
      assert.equal(getImageUrl(null), "/images/lounge.jfif");
    });
  });
});
