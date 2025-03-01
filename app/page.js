"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
// pages/login.jsx
import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    // localStorage.setItem("userName", email.split("@")[0]);
    // setError("");

    // try {
    //   // Backend API'ye kullanıcı bilgilerini gönderme
    //   const response = await fetch("/api/login", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ email, password }),
    //   });

    //   if (response.ok) {
    //     // Başarılı giriş sonrası ana sayfaya yönlendirme
    //     window.location.href = "/dashboard"; // Ana sayfanızın URL'sini buraya yazın
    //   } else {
    //     // Giriş başarısızsa hata mesajı gösterme
    //     const data = await response.json();
    //     setError(data.message || "Giriş başarısız.");
    //   }
    // } catch (err) {
    //   setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    // }
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-fit mt-24 bg-gray-100">
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
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-posta
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresinizi girin"
              className="mt-1 block w-full"
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
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-blue-500 hover:underline">
            Şifremi Unuttum
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
