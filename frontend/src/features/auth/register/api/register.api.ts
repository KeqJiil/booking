import { api } from "@/shared/api/axios.interceptors";
import type { IReturnTypeAuth } from "../../types";
import type { IRegisterData } from "../model/types";

export const registerFn = async (
  reqData: IRegisterData,
): Promise<IReturnTypeAuth> => {
  const { data } = await api.post("/auth/register", reqData);
  return data;
};
