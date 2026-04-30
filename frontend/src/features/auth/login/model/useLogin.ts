import { useMutation } from "@tanstack/react-query";
import { loginFn } from "../api/login.api";
import { useAuthToken } from "@shared/api/auth.store";
import type { ILoginData } from "./types";
import { toast } from "sonner";

export const useLogin = () => {
  const accessToken = useAuthToken((state) => state.accessToken);
  const setAccessToken = useAuthToken((state) => state.setToken);

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: ILoginData) => {
      if (accessToken) return null;
      return await loginFn(data);
    },
    onSuccess: (data) => {
      if (data === null) return;
      setAccessToken(data.accessToken);
      toast.info("Logged in!");
    },
    onError: (error) => {
      toast.info(`Something went wrong: ${error.message}`);
    },
  });

  return { mutate, isPending, isError, error };
};
