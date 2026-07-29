import axios from "@/axios";

export const submitUpdateLoungeManager = async ({ loungeManagerId, firstName, lastName }) => {
  const body = {};
  if (firstName?.trim()) body.firstName = firstName.trim();
  if (lastName?.trim()) body.lastName = lastName.trim();

  const { data } = await axios.patch(`/lounge-manager/${loungeManagerId}`, body);
  return data;
};
