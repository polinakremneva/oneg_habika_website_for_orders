import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/orders");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <Card className="w-1/3 p-5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ברוך שובך</CardTitle>
          <CardDescription className="text-gray-600">
            התחבר לחשבון שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};
