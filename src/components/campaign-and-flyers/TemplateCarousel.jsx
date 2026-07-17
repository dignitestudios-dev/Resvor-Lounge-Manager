"use client";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { campaignAndFlyers } from "@/lib/constants";

const TemplateCarousel = ({ onSelectTemplate, selectedId: propSelectedId }) => {
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
            {templates.map((template) => (
              <SwiperSlide key={template.id}>
                <div
                  onClick={() => handleSelectTemplate(template)}
                  className="cursor-pointer group"
                >
                  <div
                    className={`rounded-lg border-2 transition-all p-2 bg-white overflow-hidden hover:bg-gray-50 ${selectedId === template.id
                      ? "border-primary"
                      : "border-transparent"
                      }`}
                  >
                    <Image
                      src={template.image}
                      alt={`Template ${template.id}`}
                      width={80}
                      height={100}
                      className="w-full h-auto object-cover rounded"
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
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
