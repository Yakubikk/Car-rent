import { LoginForm } from "../../components/blocks/auth/login";

const LoginPage = () => {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <LoginForm />
    </div>
  );
};

export { LoginPage };
export default LoginPage;
