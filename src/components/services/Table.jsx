"use client";

import React, { useMemo, useState } from "react";
import utils from "@/lib/utils";
import Edit from "../icons/Edit";
import Delete from "../icons/sidebar/Delete";
import { Button } from "../ui/button";
import AddServiceForm from "./AddServiceForm";
import DeleteServicePopup from "./DeleteServicePopup";
import { useDeleteService } from "@/lib/hooks/mutations/ServiceMutations";
import { useServices } from "@/lib/hooks/queries/useService";
import { useQueryClient } from "@tanstack/react-query";


const Table = () => {
  const [currentPage] = useState(1);

  // Fetch services
  const { data, isLoading } = useServices(currentPage);

  // Delete mutation
  const { mutate: deleteService, isPending: deleting } =
    useDeleteService();

  const [selectedService, setSelectedService] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  // API response
  const services = data?.data || [];
  const pagination = data?.pagination;

  const [sortConfig, setSortConfig] = useState({
    key: "serviceName",
    direction: "asc",
  });

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      if (!sortConfig.key) return 0;

      let valA = a?.[sortConfig.key];
      let valB = b?.[sortConfig.key];

      if (sortConfig.key === "price") {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB)
        return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB)
        return sortConfig.direction === "asc" ? 1 : -1;

      return 0;
    });
  }, [services, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";

    if (
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({
      key,
      direction,
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl overflow-y-auto shadow-sm">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-[#E8E8FF]">
            <tr>
              <th
                onClick={() => requestSort("serviceName")}
                className="px-4 py-5 text-left cursor-pointer"
              >
                Service Name{" "}
                {/* {sortConfig.key === "serviceName" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")} */}
              </th>

              <th className="px-4 py-5 text-left">
                Description
              </th>

              <th
                onClick={() => requestSort("price")}
                className="px-4 py-5 text-left cursor-pointer"
              >
                Price ($){" "}
                {sortConfig.key === "price" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>

              <th className="px-4 py-5 text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10"
                >
                  Loading services...
                </td>
              </tr>
            ) : sortedServices.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10"
                >
                  No services found.
                </td>
              </tr>
            ) : (
              sortedServices.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-[#D4D4D4] hover:bg-gray-50"
                >
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                     <div
  className="h-10 w-10 rounded-full bg-cover bg-center"
  style={{
    backgroundImage: `url(${
      service.images?.[0]?.location ||
      "/images/service.jpg"
    })`,
  }}
/>

                      <span className="font-medium">
                        {service.serviceName || service.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-5 text-gray-700">
                    {service.description}
                  </td>

                  <td className="px-4 py-5 font-semibold">
  ${service.price}
</td>

                  <td>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedService(service);
                          setOpenEditForm(true);
                        }}
                      >
                        <Edit />
                      </Button>

                      <Button
  variant="ghost"
  disabled={deleting}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddServiceForm
        isOpen={openEditForm}
        onOpenChange={setOpenEditForm}
        data={selectedService}
        isEdit
        showTrigger={false}
      />

      <DeleteServicePopup
        isOpen={openDeletePopup}
        onOpenChange={setOpenDeletePopup}
          deleting={deleting}

       onDelete={() => {
  if (!selectedService) return;

  deleteService(selectedService._id, {
    onSuccess: () => {
      setOpenDeletePopup(false);
      setSelectedService(null);
    },

    onError: (error) => {
      console.error(error);
    },
  });
}}
      />
    </>
  );
};

export default Table;