import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { LoginForm } from "../components/LoginForm";
import { useCallback } from "react";

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = useCallback(() => {
    setTimeout(() => {
      navigate("/orders");
    }, 100);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-200 p-6">
      <Card className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-md hover:shadow-xl">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-semibold text-blue-800">
            ברוך שובך
          </CardTitle>
          <CardDescription className="text-gray-500 mt-2">
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
