import { useQuery } from "@tanstack/react-query";
import { processError } from "@/lib/utils";
import axios from "../../../axios";

const useUsers = (url, currentPage = 1) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});

  const getUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${url}?page=${currentPage}`);
      setData(data?.data);
      setPagination(data?.pagination);
    } catch (error) {
      processError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, [currentPage]);

  return { loading, data, pagination };
};

export { useUsers };







// services/api.js


// export const getServices = async (page = 1) => {
//   const { data } = await axios.get(`/services?page=${page}`);
//   return data;
// };

export const getServices = async () => {
  const { data } = await axios.get(`/lounges/services`);
  return data;
};

export const createService = async (payload) => {
  const { data } = await axios.post("/services", payload);
  return data;
};

export const updateService = async ({ id, payload }) => {
  const { data } = await axios.put(`/services/${id}`, payload);
  return data;
};

export const deleteService = async (id) => {
  const { data } = await axios.delete(`/services/${id}`);
  return data;
};