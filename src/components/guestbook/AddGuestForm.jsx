"use client";
import React from "react";
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

const AddGuestForm = ({
  isOpen,
  onOpenChange,
  data = null,
  isEdit = false,
}) => {
  // Pass the data when open from edit to and set in form data state
  // If isEdit is true call edit API else call Create API
  console.log("data to edit", data);
  console.log("Is to Edit: ", isEdit);

  const [profileImage, setProfileImage] = React.useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"text-3xl font-bold"}>
            {isEdit ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="flex gap-6 items-center">
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
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Full Name</Label>
                <Input placeholder="Full Name" className={"h-14"} />
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Email Address</Label>
                <Input
                  placeholder="email@example.com"
                  type={"email"}
                  className={"h-14"}
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Phone Number</Label>
                <Input placeholder="+1 234 567 890" className={"h-14"} />
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Date of Birth</Label>
                <Input type={"date"} className={"h-14"} />
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className={"text-base text-black"}>Add Details</Label>
                <Textarea placeholder="Add text here" className={"h-28"} />
              </div>

              <Button className={"w-full h-14 text-lg"}>
                {isEdit ? "Update" : "Save"}
              </Button>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddGuestForm;
