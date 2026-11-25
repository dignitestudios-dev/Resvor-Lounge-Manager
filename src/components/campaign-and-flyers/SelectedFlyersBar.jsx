"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Plus, X, LayoutTemplate, ImagePlus, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { campaignAndFlyers } from "@/lib/constants";
import {
  MAX_SELECTED_FLYERS,
  isDuplicatePredefinedTemplate,
} from "@/lib/utils/flyerUtils";
import FlyerPreviewCard from "./FlyerPreviewCard";

const SelectedFlyersBar = ({
  flyers = [],
  activeFlyerId,
  onSelectFlyer,
  onRemoveFlyer,
  onAddPredefined,
  onAddCustom,
}) => {
  const [chooserOpen, setChooserOpen] = useState(false);
  const [chooserStep, setChooserStep] = useState("choice"); // "choice" | "predefined"

  const openChooser = () => {
    setChooserStep("choice");
    setChooserOpen(true);
  };

  const handlePickPredefined = (template) => {
    if (isDuplicatePredefinedTemplate(flyers, template.id)) return;
    onAddPredefined(template);
    setChooserOpen(false);
    setChooserStep("choice");
  };

  const handlePickCustom = () => {
    setChooserOpen(false);
    setChooserStep("choice");
    onAddCustom();
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Selected Flyers ({flyers.length}/{MAX_SELECTED_FLYERS})
            </h3>
            <p className="text-xs text-gray-500">
              Select 1 to {MAX_SELECTED_FLYERS} flyers. Click a flyer to edit its details independently.
            </p>
          </div>

          {flyers.length < MAX_SELECTED_FLYERS && (
            <Button
              type="button"
              variant="outline"
              onClick={openChooser}
              className="h-9 px-3.5 text-xs font-semibold border-primary text-primary hover:bg-primary/5 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Flyer
            </Button>
          )}
        </div>

        {flyers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-6 px-4 text-center">
            <p className="text-xs font-medium text-gray-600">
              No flyers selected. Click{" "}
              <button
                type="button"
                onClick={openChooser}
                className="text-primary font-semibold underline cursor-pointer"
              >
                + Add Flyer
              </button>{" "}
              to select a predefined flyer or create a custom flyer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {flyers.map((flyer, index) => {
              const isActive = flyer.id === activeFlyerId;
              const displayTitle =
                flyer.values?.eventTitle?.trim() ||
                flyer.title ||
                `Flyer ${index + 1}`;

              return (
                <div
                  key={flyer.id}
                  onClick={() => onSelectFlyer(flyer.id)}
                  className={`relative rounded-xl border-2 p-2.5 bg-white cursor-pointer transition-all flex items-center gap-3 ${
                    isActive
                      ? "border-primary ring-2 ring-primary/15 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-14 shrink-0">
                    <FlyerPreviewCard
                      imageUrl={flyer.imageUrl}
                      values={flyer.values}
                      compact={true}
                      className="shadow-xs rounded-lg"
                    />
                  </div>

                  <div className="min-w-0 flex-1 pr-5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                        Flyer {index + 1}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          flyer.type === "custom"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {flyer.type === "custom" ? "Custom" : "Predefined"}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {displayTitle}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {flyer.values?.eventType || "Details pending"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFlyer(flyer.id);
                    }}
                    aria-label={`Remove Flyer ${index + 1}`}
                    title="Remove flyer"
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Flyer Chooser Dialog */}
      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent className="sm:max-w-xl max-w-[95vw] rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {chooserStep === "predefined" && (
                <button
                  type="button"
                  onClick={() => setChooserStep("choice")}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <DialogTitle className="text-xl font-bold text-gray-900">
                {chooserStep === "choice"
                  ? "Add Another Flyer"
                  : "Select a Predefined Flyer"}
              </DialogTitle>
            </div>
          </DialogHeader>

          {chooserStep === "choice" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setChooserStep("predefined")}
                className="p-5 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 text-left transition-all cursor-pointer flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-gray-900">
                  Predefined Flyer
                </p>
                <p className="text-xs text-gray-500">
                  Choose another flyer template from the predefined gallery.
                </p>
              </button>

              <button
                type="button"
                onClick={handlePickCustom}
                className="p-5 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 text-left transition-all cursor-pointer flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-gray-900">
                  Custom Flyer
                </p>
                <p className="text-xs text-gray-500">
                  Upload and crop your own flyer image with custom details.
                </p>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-h-[60vh] overflow-y-auto pr-1">
              {campaignAndFlyers.map((template) => {
                const alreadySelected = isDuplicatePredefinedTemplate(
                  flyers,
                  template.id
                );

                return (
                  <button
                    key={template.id}
                    type="button"
                    disabled={alreadySelected}
                    onClick={() => handlePickPredefined(template)}
                    className={`relative rounded-xl border-2 p-2 text-left transition-all ${
                      alreadySelected
                        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                        : "border-gray-200 hover:border-primary bg-white cursor-pointer"
                    }`}
                  >
                    <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={template.image}
                        alt={template.title}
                        fill
                        className="object-cover"
                      />
                      {alreadySelected && (
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-gray-900 text-[10px] font-bold">
                            <Check className="w-3 h-3 text-green-600" />
                            Selected
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-800 mt-1.5 line-clamp-2">
                      {template.title}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectedFlyersBar;
