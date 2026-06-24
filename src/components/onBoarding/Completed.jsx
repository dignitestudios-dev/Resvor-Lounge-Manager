"use client"
import AuthButton from "../auth/AuthButton";
import { useRouter } from "next/navigation";

const Completed = () => {
    const router = useRouter()
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
                            onClick={() => router.push("/dashboard")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Completed;