import { useForm } from "react-hook-form";
import { useRegister } from "../model/useRegister";
import { registerSchema, type IRegisterSchema } from "../model/registerForm";
import { zodResolver } from "@hookform/resolvers/zod";

export function RegisterForm() {
  const { mutate, isPending } = useRegister();

  const { register, handleSubmit, formState } = useForm<IRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { password: "", email: "", username: "" },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return <div></div>;
}
