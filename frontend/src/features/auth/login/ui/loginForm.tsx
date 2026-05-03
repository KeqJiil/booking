import { useLogin } from "../model/useLogin";
import { Button } from "@shared/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@shared/ui/input";
import { loginSchema, type ILoginSchema } from "../model/loginForm";

export function LoginForm() {
  const { mutate, isPending } = useLogin();

  const { register, handleSubmit, formState } = useForm<ILoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "", email: "" },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col">
        <Input placeholder="Enter email" {...register("email")} />
        <span
          className={`${formState.errors.email?.message ? "opacity-100" : "opacity-0"} text-red-500`}
        >
          {formState.errors.email?.message}
        </span>
        <Input placeholder="Enter password" {...register("password")} />
        <span
          className={`${formState.errors.password?.message ? "opacity-100" : "opacity-0"} text-red-500`}
        >
          {formState.errors.password?.message}
        </span>
        <Button disabled={isPending}>Login</Button>
      </form>
    </div>
  );
}
