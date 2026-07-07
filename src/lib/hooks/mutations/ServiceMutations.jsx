import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getServices } from "../api/Get";
import { processError } from "@/lib/utils";
import { submitAddService, submitUpdateService } from "../api/Post";
import { deleteService } from "../api/Delete";

export const useServices = (page = 1) => {
  return useQuery({
    queryKey: ["services", page],
    queryFn: async () => {
      try {
        return await getServices(page);
      } catch (error) {
        processError(error);
        throw error;
      }
    },
  });
};

export const useAddServiceMutation = () => {
  return useMutation({
    mutationFn: submitAddService,
  });
};


export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitUpdateService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
};


export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
};