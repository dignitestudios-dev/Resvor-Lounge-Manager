import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchGuestbook = async () => {
  const { data } = await axios.get("/guestbook");
  console.log("🚀 ~ fetchGuestbook ~ data:", data);
  return data?.data || {};
};

export const useGetGuestbook = () => {
  return useQuery({
    queryKey: ["guestbook-list"],
    queryFn: fetchGuestbook,
  });
};
