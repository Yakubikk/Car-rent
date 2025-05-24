import { useForm } from "react-hook-form";
import { login } from "@/api";

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          type="email"
          placeholder="Email"
        />
        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}

        <input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          type="password"
          placeholder="Password"
        />
        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}

        <div className="flex items-center gap-2">
          <input {...register("rememberMe")} type="checkbox" id="rememberMe" />
          <label htmlFor="rememberMe">Remember me</label>
        </div>

        <button className="p-2 bg-green-300" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export { LoginForm };
export default LoginForm;
