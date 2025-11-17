"use client";
import React, { useState } from "react";
import CustomPagination from "@/components/common/CustomPagination";
import utils from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";
import PaymentDetails from "@/components/payments/PaymentDetails";

const Table = ({ data, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const onPageChange = (page) => {
    // getAllPayments(page);
  };

  const isBookingPayment = type === "booking";

  return (
    <>
      <CustomPagination loading={false} onPageChange={onPageChange} totalPages={10}>
        <div className="bg-white rounded-xl overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#E8E8FF]">
                <th className="px-4 py-5 text-left text-nowrap">Client Name</th>
                <th className="px-4 py-5 text-left text-nowrap">Email</th>
                {isBookingPayment ? (
                  <>
                    <th className="px-4 py-5 text-left text-nowrap">Contact</th>
                    <th className="px-4 py-5 text-left text-nowrap">Payment Date</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-5 text-left text-nowrap">Event</th>
                    <th className="px-4 py-5 text-left text-nowrap">Event Date</th>
                    <th className="px-4 py-5 text-left text-nowrap">Payment Date</th>
                  </>
                )}
                <th className="px-4 py-5 text-left text-nowrap">Amount</th>
                <th className="px-4 py-5 text-center text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="mt-10">
              {data?.map((payment, index) => (
                <tr key={index} className="border-b border-[#D4D4D4]">
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-primary"
                        style={{
                          backgroundImage: `url("/images/profile.png")`,
                        }}
                      />
                      {payment?.clientName}
                    </div>
                  </td>
                  <td className="px-4 py-6">{payment?.email}</td>
                  {isBookingPayment ? (
                    <>
                      <td className="px-4 py-6">{payment?.contact}</td>
                      <td className="px-4 py-6">{utils.formatDateWithName(payment?.paymentDate)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-6">{payment?.event}</td>
                      <td className="px-4 py-6">{utils.formatDateWithName(payment?.eventDate)}</td>
                      <td className="px-4 py-6">{utils.formatDateWithName(payment?.paymentDate)}</td>
                    </>
                  )}
                  <td className="px-4 py-6">{utils.formatCurrency(payment?.amount)}</td>
                  <td className="px-4 py-6 text-nowrap">
                    <div
                      className="flex justify-center items-center cursor-pointer"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsOpen(true);
                      }}
                    >
                      <IoIosArrowForward size={24} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CustomPagination>

      <PaymentDetails isOpen={isOpen} onOpenChange={setIsOpen} data={selectedPayment} />
    </>
  );
};

export default Table;
