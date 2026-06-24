"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Camera } from "lucide-react";
import Edit2 from "../icons/Edit2";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLounges } from "@/lib/hooks/queries/useLounges";
import {
  useCreateGuest,
  useUpdateGuest,
} from "@/lib/hooks/mutations/GuestbookMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import utils from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { addGuestSchema } from "@/lib/schema/guestbook/addGuestSchema";

const AddGuestForm = ({
  isOpen,
  onOpenChange,
  data = null,
  isEdit = false,
  showTrigger = true,
}) => {
  const [selectedLoungeId, setSelectedLoungeId] = useState(() => {
    if (data?.loungeId) return data.loungeId;
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeLoungeId") || "";
    }
    return "";
  });
  const [profileImage, setProfileImage] = useState(null);
  const queryClient = useQueryClient();

  // API calls
  const { data: lounges = [], isLoading: isLoadingLounges } = useGetLounges();
  const createGuestMutation = useCreateGuest();
  const updateGuestMutation = useUpdateGuest();

  // Formik setup with Yup validation (same rules as userDetailsSchema)
  const formik = useFormik({
    initialValues: {
      fullName: data?.fullName || "",
      email: data?.email || "",
    },
    validationSchema: addGuestSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (!isEdit && !selectedLoungeId) {
          ErrorToast("Please select a lounge");
          return;
        }

        if (isEdit && data?._id) {
          // Edit mode - call update mutation
          await updateGuestMutation.mutateAsync({
            entryId: data._id,
            fullName: values.fullName,
            email: values.email,
          });
        } else {
          // Create mode - call create mutation
          await createGuestMutation.mutateAsync({
            loungeId: selectedLoungeId,
            fullName: values.fullName,
            email: values.email,
          });
        }

        queryClient.invalidateQueries(["guestbook-list"]);

        SuccessToast(
          isEdit ? "Guest updated successfully" : "Guest added successfully",
        );

        // Reset form
        formik.resetForm();
        // setSelectedLoungeId("");
        setProfileImage(null);

        onOpenChange(false);
      } catch (error) {
        ErrorToast(
          error?.response?.data?.message ||
          error?.message ||
          `Failed to ${isEdit ? "update" : "add"} guest. Please try again.`,
        );
        console.log(`${isEdit ? "Update" : "Add"} guest error:`, error);
      }
    },
  });

  // Sync selectedLoungeId with activeLoungeId from localStorage/LoungeSelector
  useEffect(() => {
    if (isEdit && data) {
      setSelectedLoungeId(data.loungeId || "");
      return;
    }

    const syncLounge = () => {
      const storedId = localStorage.getItem("activeLoungeId");
      if (storedId) {
        setSelectedLoungeId(storedId);
      } else if (lounges.length > 0) {
        setSelectedLoungeId(lounges[0]._id);
      }
    };

    syncLounge();

    window.addEventListener("activeLoungeChanged", syncLounge);
    return () => {
      window.removeEventListener("activeLoungeChanged", syncLounge);
    };
  }, [lounges, isEdit, data]);

  // Sync formik values when editing
  useEffect(() => {
    if (isEdit && data) {
      formik.setValues({
        fullName: data.fullName || "",
        email: data.email || "",
      });
      setSelectedLoungeId(data.loungeId || "");
    }
  }, [isEdit, data]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger>
          {isEdit ? (
            <Button className={"w-14! h-14!"}>
              <Edit2 className="scale-150 cursor-pointer" />
            </Button>
          ) : (
            <Button className={"border-2 h-12 text-[14px] px-6"}>
              Add New Guest
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"text-3xl font-bold"}>
            {isEdit ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
          <DialogDescription>
            <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4">
              {/* <div className="flex gap-6 items-center">
                <Label
                  htmlFor="profile"
                  className={"cursor-pointer flex items-center gap-7"}
                >
                  <div
                    className="w-20 h-20 rounded-full bg-center bg-cover flex justify-center items-center bg-gray-200"
                    style={{
                      backgroundImage: profileImage
                        ? `url(${profileImage})`
                        : "none",
                    }}
                  >
                    {!profileImage && (
                      <Camera className="w-10 h-10 text-gray-500" />
                    )}
                  </div>
                  <p className="text-primary font-semibold">
                    Add Guest Image{" "}
                    <span className="text-primary/30"> (Optional)</span>
                  </p>
                  <Input
                    id="profile"
                    type={"file"}
                    className={"hidden"}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Label>
              </div> */}

              <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Full Name</Label>
                <Input
                  placeholder="Full Name"
                  className={"h-14"}
                  id="fullName"
                  name="fullName"
                  maxLength={64}
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.errors.fullName && formik.touched.fullName && (
                  <p className="text-red-500 text-[11px] font-medium mt-1">
                    {formik.errors.fullName}
                  </p>
                )}
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Email Address</Label>
                <Input
                  placeholder="email@example.com"
                  type={"email"}
                  className={"h-14"}
                  id="email"
                  name="email"
                  maxLength={50}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.errors.email && formik.touched.email && (
                  <p className="text-red-500 text-[11px] font-medium mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Phone Number</Label>
                <Input placeholder="+1 234 567 890" className={"h-14"} />
              </div> */}

              {/* <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Date of Birth</Label>
                <Input type={"date"} className={"h-14"} />
              </div> */}


              {/* <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Add Details</Label>
                <Textarea placeholder="Add text here" className={"h-28"} />
              </div> */}

              <Button
                className={"w-full h-14 text-lg"}
                disabled={
                  isEdit
                    ? updateGuestMutation.isPending
                    : createGuestMutation.isPending
                }
              >
                {isEdit
                  ? updateGuestMutation.isPending
                    ? "Updating..."
                    : "Update"
                  : createGuestMutation.isPending
                    ? "Saving..."
                    : "Save"}
              </Button>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddGuestForm;
