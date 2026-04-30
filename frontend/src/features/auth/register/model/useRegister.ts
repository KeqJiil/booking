import { useMutation } from "@tanstack/react-query";
import type { IRegisterData } from "./types";
import { registerFn } from "../api/register.api";
import { toast } from "sonner";
import { useAuthToken } from "@shared/api/auth.store";

export const useRegister = () => {
  const accessToken = useAuthToken((state) => state.accessToken);
  const setAccessToken = useAuthToken((state) => state.setToken);

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["register"],
    mutationFn: async (data: IRegisterData) => {
      if (accessToken) return null;
      return await registerFn(data);
    },
    onSuccess: (data) => {
      if (data === null) return;
      setAccessToken(data.accessToken);
      toast.info("Account created!");
    },
    onError: (error) => {
      toast.info(`Something went wrong: ${error.message}`);
    },
  });

  return { mutate, isPending, isError, error };
};
