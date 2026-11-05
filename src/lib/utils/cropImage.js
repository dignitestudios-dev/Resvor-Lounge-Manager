/**
 * Utility functions for image validation and canvas cropping to 500x500px resolution.
 */

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Validates selected file for profile picture.
 * @param {File} file
 * @param {number} [maxSizeBytes=10485760] (default 10MB)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateProfileImage(file, maxSizeBytes = 10 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: "Please select an image file." };
  }

  const mime = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();

  const matchesMime = ALLOWED_IMAGE_MIME_TYPES.includes(mime);
  const matchesExt = ALLOWED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));

  if (!matchesMime && !matchesExt) {
    return {
      valid: false,
      error: "Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.",
    };
  }

  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds ${maxMb}MB. Please select a smaller image.`,
    };
  }

  return { valid: true };
}

/**
 * Loads an image from a URL or ObjectURL.
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) =>
      reject(new Error("Failed to load image for cropping"))
    );
    if (!url.startsWith("data:") && !url.startsWith("blob:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    image.src = url;
  });

/**
 * Crops an image to specified pixel coordinates and exports at target resolution (default 500x500px).
 *
 * @param {string} imageSrc - The source image URL / object URL / data URL.
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop - Crop pixel coordinates.
 * @param {number} [outputWidth=500] - Export width in pixels (500px).
 * @param {number} [outputHeight=500] - Export height in pixels (500px).
 * @param {string} [mimeType="image/jpeg"] - Desired output MIME type (JPG/PNG/WEBP).
 * @param {string} [fileName="profile-500x500.jpg"] - Desired output file name.
 * @returns {Promise<{ file: File, blob: Blob, previewUrl: string, width: number, height: number }>}
 */
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  outputWidth = 500,
  outputHeight = 500,
  mimeType = "image/jpeg",
  fileName = "profile-500x500.jpg"
) {
  if (!imageSrc) {
    throw new Error("No image source provided for cropping.");
  }

  if (!pixelCrop || pixelCrop.width <= 0 || pixelCrop.height <= 0) {
    throw new Error("Invalid crop coordinates.");
  }

  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to initialize 2D canvas context.");
  }

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Normalise MIME type
  let targetMime = (mimeType || "").toLowerCase();
  if (targetMime === "image/jpg") targetMime = "image/jpeg";
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(targetMime)) {
    targetMime = "image/jpeg";
  }

  // For JPEG, fill with white background in case source had alpha channel
  if (targetMime === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, outputWidth, outputHeight);
  }

  // Draw the selected crop region onto the 500x500 canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed: could not generate image blob."));
          return;
        }

        // Clean file extension matching MIME
        let ext = ".jpg";
        if (targetMime === "image/png") ext = ".png";
        else if (targetMime === "image/webp") ext = ".webp";

        let cleanName = fileName || `profile-cropped${ext}`;
        if (!cleanName.toLowerCase().endsWith(ext)) {
          cleanName = cleanName.replace(/\.[^/.]+$/, "") + ext;
        }

        const file = new File([blob], cleanName, {
          type: targetMime,
          lastModified: Date.now(),
        });

        const previewUrl = URL.createObjectURL(blob);

        resolve({
          file,
          blob,
          previewUrl,
          width: outputWidth,
          height: outputHeight,
        });
      },
      targetMime,
      0.92
    );
  });
}

