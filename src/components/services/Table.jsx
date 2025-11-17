"use client";
import utils from "@/lib/utils";
import React, { useState } from "react";
import Edit from "../icons/Edit";
import Delete from "../icons/sidebar/Delete";
import { Button } from "../ui/button";
import AddServiceForm from "./AddServiceForm";
import DeleteServicePopup from "./DeleteServicePopup";

const Table = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const services = [
    {
      serviceName: "Premium Cocktail Mix",
      serviceImage: "/images/service.jpg",
      description: "A handcrafted blend of exotic spirits and flavors.",
      price: 45,
    },
    {
      serviceName: "Wine Serving",
      serviceImage: "/images/service.jpg",
      description: "Professional wine serving for events and parties.",
      price: 30,
    },
    {
      serviceName: "Custom Bar Setup",
      serviceImage: "/images/service.jpg",
      description: "Full bar installation and decor for private functions.",
      price: 120,
    },
    {
      serviceName: "Bartender On Demand",
      serviceImage: "/images/service.jpg",
      description: "Hire an expert bartender for any occasion.",
      price: 85,
    },
    {
      serviceName: "Cocktail Workshop",
      serviceImage: "/images/service.jpg",
      description: "Interactive cocktail-making session for groups.",
      price: 60,
    },
    {
      serviceName: "Mocktail Service",
      serviceImage: "/images/service.jpg",
      description: "Non-alcoholic beverages for corporate or family events.",
      price: 25,
    },
    {
      serviceName: "Event Beverage Coordination",
      serviceImage: "/images/service.jpg",
      description: "Complete drink menu planning and execution.",
      price: 150,
    },
    {
      serviceName: "Signature Drink Creation",
      serviceImage: "/images/service.jpg",
      description: "Custom-crafted signature drinks tailored to your event.",
      price: 70,
    },
    {
      serviceName: "Portable Bar Rental",
      serviceImage: "/images/service.jpg",
      description: "Compact and elegant portable bars for outdoor events.",
      price: 100,
    },
    {
      serviceName: "VIP Lounge Service",
      serviceImage: "/images/service.jpg",
      description: "Luxury drink service for high-end or private gatherings.",
      price: 200,
    },
  ];

  return (
    <>
      <div className="bg-white rounded-xl overflow-y-auto shadow-sm">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-[#E8E8FF]">
            <tr>
              <th className="px-4 py-5 text-left text-nowrap">Service Name</th>
              <th className="px-4 py-5 text-left text-nowrap">Description</th>
              <th className="px-4 py-5 text-left text-nowrap">Price ($)</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr
                key={index}
                className="border-b border-[#D4D4D4] hover:bg-gray-50"
              >
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${service.serviceImage})`,
                      }}
                    />
                    <span className="font-medium">{service.serviceName}</span>
                  </div>
                </td>
                <td className="px-4 py-5 text-gray-700">
                  {service.description}
                </td>
                <td className="px-4 py-5 font-semibold">
                  {utils.formatCurrency(service.price)}
                </td>
                <td>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={"ghost"}
                      onClick={() => {
                        setSelectedService(service);
                        setOpenEditForm(true);
                      }}
                    >
                      <Edit />
                    </Button>
                    <Button
                      variant={"ghost"}
                      onClick={() => {
                        setSelectedService(service);
                        setOpenDeletePopup(true);
                      }}
                    >
                      <Delete />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteServicePopup
        isOpen={openDeletePopup}
        onOpenChange={setOpenDeletePopup}
        onDelete={() => {
          console.log("Service to delete: ", selectedService);
          setOpenDeletePopup(false);
        }}
      />
    </>
  );
};

export default Table;
