import axios from "../../../axios";

export const deleteService = async (serviceId) => {
  const { data } = await axios.delete(`/lounges/services/${serviceId}`);
  return data;
};