import html2canvas from "html2canvas-pro";
import { hasFlyerOverlayData } from "@/lib/utils/flyerUtils";

/**
 * Generates an image File for a single flyer item using its custom file (if no overlay)
 * or by capturing its rendered FlyerPreviewCard DOM node with html2canvas.
 */
export const generateSingleFlyerFile = async (flyer, element, index = 0) => {
  if (flyer.type === "custom" && flyer.imageFile && !hasFlyerOverlayData(flyer.values)) {
    return flyer.imageFile;
  }

  if (!element) {
    if (flyer.imageFile) return flyer.imageFile;
    throw new Error(`Flyer ${index + 1} preview element not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const baseName = flyer.imageFile?.name || `flyer-${index + 1}.png`;
          resolve(new File([blob], baseName, { type: "image/png" }));
        } else {
          reject(new Error(`Canvas blob generation failed for Flyer ${index + 1}`));
        }
      },
      "image/png",
      1.0
    );
  });
};

/**
 * Generates final File objects and payload entries for all selected flyers (1 to 3).
 */
export const generateAllFlyerFiles = async (flyers = [], refsMap = {}) => {
  const results = [];
  for (let i = 0; i < flyers.length; i += 1) {
    const flyer = flyers[i];
    const file = await generateSingleFlyerFile(flyer, refsMap[flyer.id], i);
    results.push({
      id: flyer.id,
      title: flyer.values?.eventTitle || flyer.title || `Flyer ${i + 1}`,
      previewUrl: flyer.imageUrl,
      additionalInfo: flyer.editorContent || "",
      file,
    });
  }
  return results;
};
