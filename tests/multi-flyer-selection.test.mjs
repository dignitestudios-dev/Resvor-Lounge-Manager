import { test, describe } from "node:test";
import assert from "node:assert/strict";
import * as Yup from "yup";

import {
  MAX_SELECTED_FLYERS,
  addFlyerToList,
  canAddMoreFlyers,
  createFlyerItem,
  isDuplicatePredefinedTemplate,
  removeFlyerFromList,
  validateFlyersSelection,
} from "../src/lib/utils/flyerUtils.js";

const mockFlyerSchema = Yup.object({
  eventType: Yup.string().required(),
  eventTitle: Yup.string().required(),
  eventDate: Yup.string().required(),
  eventStartTime: Yup.string().required(),
  eventEndTime: Yup.string().required(),
  address: Yup.string().required(),
});

const validDetails = {
  eventType: "Birthday Celebration",
  eventTitle: "VIP Birthday Bash",
  eventDate: "2099-12-31",
  eventStartTime: "20:00",
  eventEndTime: "23:00",
  address: "123 Main Street",
  city: "New York",
};

describe("Multiple Flyers Selection System", () => {
  test("Allows adding 1 to 3 flyers mixing predefined and custom types", () => {
    const f1 = createFlyerItem({
      type: "predefined",
      templateId: 5,
      title: "Anniversary Celebration Flyer",
      imageUrl: "/images/flyerImageFive.jpg",
      values: validDetails,
    });
    const f2 = createFlyerItem({
      type: "custom",
      title: "Custom Flyer 1",
      imageUrl: "blob:custom-1",
      values: { ...validDetails, eventTitle: "Custom Night" },
    });
    const f3 = createFlyerItem({
      type: "predefined",
      templateId: 6,
      title: "Birthday Celebration Flyer",
      imageUrl: "/images/flyerImageSix.jpg",
      values: { ...validDetails, eventTitle: "Third Flyer" },
    });
    const f4 = createFlyerItem({
      type: "custom",
      title: "Custom Flyer 2",
      imageUrl: "blob:custom-2",
      values: validDetails,
    });

    let list = [f1];
    assert.equal(canAddMoreFlyers(list), true);

    const res2 = addFlyerToList(list, f2);
    assert.equal(res2.ok, true);
    list = res2.flyers;
    assert.equal(list.length, 2);

    const res3 = addFlyerToList(list, f3);
    assert.equal(res3.ok, true);
    list = res3.flyers;
    assert.equal(list.length, MAX_SELECTED_FLYERS);
    assert.equal(canAddMoreFlyers(list), false);

    // 4th flyer must be rejected
    const res4 = addFlyerToList(list, f4);
    assert.equal(res4.ok, false);
    assert.equal(res4.flyers.length, 3);
  });

  test("Prevents duplicate selection of the same predefined flyer", () => {
    const f1 = createFlyerItem({
      type: "predefined",
      templateId: 5,
      title: "Anniversary Celebration Flyer",
      imageUrl: "/images/flyerImageFive.jpg",
    });
    const duplicate = createFlyerItem({
      type: "predefined",
      templateId: 5,
      title: "Anniversary Celebration Flyer",
      imageUrl: "/images/flyerImageFive.jpg",
    });

    assert.equal(isDuplicatePredefinedTemplate([f1], 5), true);
    assert.equal(isDuplicatePredefinedTemplate([f1], 5, f1.id), false);

    const res = addFlyerToList([f1], duplicate);
    assert.equal(res.ok, false);
    assert.equal(res.flyers.length, 1);
  });

  test("Removes any selected flyer without affecting remaining flyers", () => {
    const f1 = createFlyerItem({
      id: "a",
      type: "predefined",
      templateId: 5,
      imageUrl: "/images/flyerImageFive.jpg",
      values: { ...validDetails, eventTitle: "First" },
    });
    const f2 = createFlyerItem({
      id: "b",
      type: "custom",
      imageUrl: "blob:b",
      values: { ...validDetails, eventTitle: "Second" },
    });

    const { flyers: afterRemove, nextActiveId } = removeFlyerFromList([f1, f2], "a");
    assert.equal(afterRemove.length, 1);
    assert.equal(afterRemove[0].id, "b");
    assert.equal(afterRemove[0].values.eventTitle, "Second");
    assert.equal(nextActiveId, "b");
  });

  test("Validates minimum 1 flyer, image presence, and independent event details", async () => {
    const emptyRes = await validateFlyersSelection([], mockFlyerSchema);
    assert.equal(emptyRes.valid, false);

    const missingImage = createFlyerItem({
      id: "custom-no-img",
      type: "custom",
      values: validDetails,
    });
    const imgRes = await validateFlyersSelection([missingImage], mockFlyerSchema);
    assert.equal(imgRes.valid, false);
    assert.equal(imgRes.invalidFlyerId, "custom-no-img");

    const f1 = createFlyerItem({
      id: "f1",
      type: "predefined",
      templateId: 5,
      imageUrl: "/images/flyerImageFive.jpg",
      values: validDetails,
    });
    const f2Invalid = createFlyerItem({
      id: "f2",
      type: "custom",
      imageUrl: "blob:custom",
      values: { ...validDetails, eventTitle: "" },
    });
    const invalidRes = await validateFlyersSelection([f1, f2Invalid], mockFlyerSchema);
    assert.equal(invalidRes.valid, false);
    assert.equal(invalidRes.invalidFlyerId, "f2");

    const validRes = await validateFlyersSelection([
      f1,
      { ...f2Invalid, values: { ...validDetails, eventTitle: "Custom Event" } },
    ], mockFlyerSchema);
    assert.equal(validRes.valid, true);
  });
});
