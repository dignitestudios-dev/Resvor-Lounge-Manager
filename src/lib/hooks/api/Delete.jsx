import axios from "../../../axios";

export const deleteService = async (serviceId) => {
  const { data } = await axios.delete(`/lounges/services/${serviceId}`);
  return data;
};

export const deleteLounge = async (loungeId) => {
  const endpoint = loungeId ? `/lounges/${loungeId}` : "/lounges";
  const { data } = await axios.delete(endpoint);
  return data;
};
