"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [showSmsVerification, setShowSmsVerification] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    localStorage.setItem("userName", userName);
    setError("");

    try {
      const response = await axios.post(
        "https://identity-service.vialand.com/User/Login",
        {
          userName: userName,
          password: password,
        }
      );

      // Successful login
      if (response.status === 200) {
        console.log("Login Response", response.data);
        // Show SMS verification instead of redirecting
        setShowSmsVerification(true);
      } else {
        console.log("Login Response", response.data);
        return;
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Giriş başarısız. Lütfen tekrar deneyin."
      );
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setVerificationError("");

    try {
      const response = await axios.post(
        "https://identity-service.vialand.com/User/Verify",
        {
          userId: userName,
          code: smsCode,
        }
      );

      // Successful verification
      if (response.status === 200) {
        console.log("Verification Response", response.data);

        // Store token and userName in localStorage
        if (response.data.isSuccess) {
          localStorage.setItem("userName", response.data.data.userName);
          localStorage.setItem("jwtToken", response.data.data.jwtToken);
          console.log("Token saved to localStorage");
        } else {
          setError(
            err.response?.data?.message ||
              "Giriş başarısız. Lütfen tekrar deneyin."
          );
          return;
        }

        // Redirect based on user role after successful verification
        if (userName === "camera-kullanıcı") {
          router.push("/cam-reader");
        } else {
          router.push("/qr-reader");
        }
      } else {
        console.log("Verification Response", response.data);
        setVerificationError("Doğrulama başarısız. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setVerificationError(
        err.response?.data?.message ||
          "Doğrulama başarısız. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen min-h-fit bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center my-6">
          <Image
            src="/logo.png"
            width={200}
            height={200}
            alt="Logo"
            className="mx-auto"
          />
        </div>

        {!showSmsVerification ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700"
              >
                Kullanıcı Adı
              </label>
              <Input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                className="mt-1 block w-full"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Şifre
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                className="mt-1 block w-full"
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerification}>
            <div className="mb-6">
              <label
                htmlFor="smsCode"
                className="block text-sm font-medium text-gray-700"
              >
                SMS Doğrulama Kodu
              </label>
              <Input
                id="smsCode"
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                placeholder="SMS kodunu girin"
                className="mt-1 block w-full"
                required
              />
            </div>
            {verificationError && (
              <p className="text-red-500 mb-4">{verificationError}</p>
            )}
            <Button type="submit" className="w-full">
              Doğrula
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
