import { api } from "@/shared/api/axios.interceptors";
import type { ILoginData } from "../model/types";
import type { IReturnTypeAuth } from "../../types";

export const loginFn = async (
  reqData: ILoginData,
): Promise<IReturnTypeAuth> => {
  const { data } = await api.post("/auth/login", reqData);
  return data;
};
