"use client";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { campaignAndFlyers } from "@/lib/constants";

const TemplateCarousel = ({
  onSelectTemplate,
  selectedId: propSelectedId,
  disabledIds = [],
}) => {
  const swiperRef = useRef(null);
  const [localSelectedId, setLocalSelectedId] = useState(1);
  const selectedId = propSelectedId !== undefined ? propSelectedId : localSelectedId;

  // Use dynamic templates from campaignAndFlyers constants
  const templates = campaignAndFlyers;

  const handlePrev = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handleSelectTemplate = (template) => {
    if (disabledIds.some((id) => String(id) === String(template.id))) {
      return;
    }
    if (propSelectedId === undefined) {
      setLocalSelectedId(template.id);
    }
    onSelectTemplate(template);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous template"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Carousel */}
        <div className="flex-1 overflow-hidden">
          <Swiper
            ref={swiperRef}
            modules={[Navigation]}
            spaceBetween={12}
            slidesPerView={5}
            loop={false}
            className="w-full"
          >
            {templates.map((template) => {
              const isDisabled = disabledIds.some(
                (id) => String(id) === String(template.id)
              );
              const isSelected = String(selectedId) === String(template.id);

              return (
                <SwiperSlide key={template.id}>
                  <div
                    onClick={() => handleSelectTemplate(template)}
                    className={`group ${
                      isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`relative rounded-lg border-2 transition-all p-2 bg-white overflow-hidden hover:bg-gray-50 ${
                        isSelected ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={template.image}
                        alt={`Template ${template.id}`}
                        width={80}
                        height={100}
                        className="w-full h-auto object-cover rounded"
                      />
                      {isDisabled && (
                        <span className="absolute bottom-1.5 inset-x-1.5 text-center text-[9px] font-semibold bg-black/70 text-white rounded py-0.5">
                          Added
                        </span>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next template"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default TemplateCarousel;
