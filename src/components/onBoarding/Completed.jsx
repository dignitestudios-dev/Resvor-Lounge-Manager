"use client";
import AuthButton from "../auth/AuthButton";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthProvider";
import { useState } from "react";

const Completed = () => {
    const router = useRouter()
    const { refetchAuth } = useAuthContext()
    const [loading, setLoading] = useState(false)

    const handleExplore = async () => {
        try {
            setLoading(true);
            localStorage.setItem("show_welcome_walkthrough", "true");
            await refetchAuth();
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to refetch auth status:", error);
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-auto ">
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
                            loading={loading}
                            disabled={loading}
                            onClick={handleExplore}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Completed;