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

const AddGuestForm = ({
  isOpen,
  onOpenChange,
  data = null,
  isEdit = false,
  showTrigger = true,
}) => {

  // State for form fields
  const [fullName, setFullName] = useState(data?.fullName || "");
  const [email, setEmail] = useState(data?.email || "");
  const [selectedLoungeId, setSelectedLoungeId] = useState(
    data?.loungeId || "",
  );
  const [profileImage, setProfileImage] = useState(null);
  const queryClient = useQueryClient();

  // API calls
  const { data: lounges = [], isLoading: isLoadingLounges } = useGetLounges();
  const createGuestMutation = useCreateGuest();
  const updateGuestMutation = useUpdateGuest();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!fullName.trim()) {
        ErrorToast("Please enter full name");
        return;
      }

      if (!email.trim()) {
        ErrorToast("Please enter email address");
        return;
      }

      if (!isEdit && !selectedLoungeId) {
        ErrorToast("Please select a lounge");
        return;
      }

      if (isEdit && data?._id) {
        // Edit mode - call update mutation
        await updateGuestMutation.mutateAsync({
          entryId: data._id,
          fullName: fullName,
          email: email,
        });
      } else {
        // Create mode - call create mutation
        await createGuestMutation.mutateAsync({
          loungeId: selectedLoungeId,
          fullName: fullName,
          email: email,
        });
      }

      queryClient.invalidateQueries(["guestbook-list"]);

      SuccessToast(
        isEdit ? "Guest updated successfully" : "Guest added successfully",
      );

      // Reset form
      setFullName("");
      setEmail("");
      setSelectedLoungeId("");
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
  };

  useEffect(() => {
    if (isEdit && data) {
      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setSelectedLoungeId(data.loungeId || "");
    }
  }, [isEdit, data]);

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
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Email Address</Label>
                <Input
                  placeholder="email@example.com"
                  type={"email"}
                  className={"h-14"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Phone Number</Label>
                <Input placeholder="+1 234 567 890" className={"h-14"} />
              </div> */}

              {/* <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Date of Birth</Label>
                <Input type={"date"} className={"h-14"} />
              </div> */}

              <div className="col-span-2 flex flex-col gap-1">
                <Label className={"text-black"}>Select Lounge</Label>

                <Select
                  value={selectedLoungeId}
                  onValueChange={setSelectedLoungeId}
                  disabled={isEdit}
                >
                  <SelectTrigger className={"w-full h-14!"}>
                    <SelectValue placeholder="Select a Lounge" />
                  </SelectTrigger>
                  <SelectContent className={"h-[200px]"}>
                    <SelectGroup>
                      <SelectLabel>Lounge</SelectLabel>
                      {isLoadingLounges ? (
                        <SelectItem disabled value="">
                          Loading lounges...
                        </SelectItem>
                      ) : lounges.length > 0 ? (
                        lounges.map((lounge) => (
                          <SelectItem
                            className={"text-black"}
                            value={lounge._id}
                            key={lounge._id}
                          >
                            {lounge.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="">
                          No lounges available
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

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
