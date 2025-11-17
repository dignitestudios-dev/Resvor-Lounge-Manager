/* eslint-disable react/prop-types */
import { useState } from "react";
import BuySubscriptionModal from "./BuySubscriptionModal";
import AuthButton from "../auth/AuthButton";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useRouter } from "next/navigation";

const Subscription = ({ handlePrevious }) => {
  const router = useRouter();
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isVip, setIsVip] = useState(false);
  return (
    <div className="flex flex-col justify-center items-center h-auto ">
      <div className="flex justify-start items-center absolute top-12 left-0">
        <button type="button" onClick={() => handlePrevious()}>
          <FaArrowLeftLong color="white" size={24} />
        </button>
      </div>
      {completed ? (
        <div className="mt-4 xxl:w-[400px] xxl:ml-12 text-center space-y-3.5 max-w-[440px] px-4">
          <div className="flex justify-center pb-4">
            <img
              src={"/images/successLight.png"}
              alt="success"
              className="w-[120px]"
            />
          </div>
          <p className="xxl:text-[48px] text-[36px] text-[#E6E6E6] font-[600] capitalize">
            Account Created
          </p>
          <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6] ">
            Your profile has been created successfully.
          </p>
          <div className="mt-6 ">
            <div className="xxl:w-[650px] w-[350px] mt-1 mb-4">
              <AuthButton
                type="button"
                text={"Explore Dashboard"}
                onClick={() => router.push("/dashboard")}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 text-center space-y-4 max-w-[800px] px-4">
            <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
              Subscription Plans
            </p>
            <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6] ">
              Choose the Right Plan for Your Lounge. Manage events, track guests, and grow your lounge with Resvor&apos;s professional tools.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="mt-10 w-full max-w-[1100px] px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan 1 - Platinum */}
              <div className="bg-white/5 border border-white/20 rounded-[20px] p-6 flex flex-col min-h-[400px] hover:border-white/40 transition">
                <div className="text-sm text-[#BEC2C9] mb-4">Plan 1</div>
                <h2 className="text-3xl font-bold text-white mb-2">Platinum</h2>
                <div className="text-4xl font-bold text-white mb-6">
                  $199.95
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>Unlimited Guests</span>
                  </li>
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>Unlimited Events</span>
                  </li>
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>Delivery by Text or Email</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSubscriptionModal(true)}
                  className="w-full bg-white text-[#181818] font-semibold py-3 rounded-[12px] hover:bg-gray-100 transition"
                >
                  Buy Now
                </button>
              </div>

              {/* Plan 2 - Premium */}
              <div className="bg-white/5 border border-white/20 rounded-[20px] p-6 flex flex-col min-h-[400px] hover:border-white/40 transition">
                <div className="text-sm text-[#BEC2C9] mb-4">Plan 2</div>
                <h2 className="text-3xl font-bold text-white mb-2">Premium</h2>
                <div className="text-4xl font-bold text-[#FFA500] mb-6">
                  $99.95
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>1000 guests per event</span>
                  </li>
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>Unlimited Events</span>
                  </li>
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>Delivery by Text or Email</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSubscriptionModal(true)}
                  className="w-full bg-white text-[#181818] font-semibold py-3 rounded-[12px] hover:bg-gray-100 transition"
                >
                  Buy Now
                </button>
              </div>

              {/* Plan 3 - Plus */}
              <div className="bg-white/5 border border-white/20 rounded-[20px] p-6 flex flex-col min-h-[400px] hover:border-white/40 transition">
                <div className="text-sm text-[#BEC2C9] mb-4">Plan 3</div>
                <h2 className="text-3xl font-bold text-white mb-2">Plus</h2>
                <div className="text-4xl font-bold text-[#FFA500] mb-6">
                  $59.95
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>500 guests per event</span>
                  </li>
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>Unlimited Events</span>
                  </li>
                  <li className="text-[#E6E6E6] flex items-start">
                    <span className="mr-3 mt-0.5">•</span>
                    <span>Delivery by Text or Email</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSubscriptionModal(true)}
                  className="w-full bg-white text-[#181818] font-semibold py-3 rounded-[12px] hover:bg-gray-100 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {subscriptionModal && (
        <BuySubscriptionModal
          onClick={() => setSubscriptionModal(false)}
          setCompleted={setCompleted}
          isVip={isVip}
        />
      )}
    </div>
  );
};

export default Subscription;
