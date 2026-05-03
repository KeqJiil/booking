import { useForm } from "react-hook-form";
import { useRegister } from "../model/useRegister";
import { registerSchema, type IRegisterSchema } from "../model/registerForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@shared/ui/input";
import { Button } from "@shared/ui/button";

export function RegisterForm() {
  const { mutate, isPending } = useRegister();

  const { register, handleSubmit, formState } = useForm<IRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { password: "", email: "", username: "" },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Input placeholder="Enter email" {...register("email")} />
        <span
          className={`${formState.errors.email?.message ? "opacity-100" : "opacity-0"} text-red-500`}
        >
          {formState.errors.email?.message}
        </span>
        <Input placeholder="Enter username" {...register("username")} />
        <span
          className={`${formState.errors.username?.message ? "opacity-100" : "opacity-0"} text-red-500`}
        >
          {formState.errors.username?.message}
        </span>
        <Input placeholder="Enter password" {...register("password")} />
        <span
          className={`${formState.errors.password?.message ? "opacity-100" : "opacity-0"} text-red-500`}
        >
          {formState.errors.password?.message}
        </span>
        <Button disabled={isPending}>Create new Account</Button>
      </form>
    </div>
  );
}
