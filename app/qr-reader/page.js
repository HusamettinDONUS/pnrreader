"use client";

import React, { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import axios from "axios";

// items1 ve items2 sabit dizilerine artık ihtiyaç yok çünkü API'den gelecek

const QRTextInputDashboard = () => {
  const inputRef = useRef(null);
  const [qrCode, setQrCode] = useState("");
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState(null);
  const [usedItems, setUsedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [items, setItems] = useState([]);
  const [processingItems, setProcessingItems] = useState([]);
  const [userName, setUserName] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    // Only access localStorage in browser environment
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("userName") ?? null);
      setJwtToken(localStorage.getItem("jwtToken") ?? null);

      // Input alanına focus yapma
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, []);

  const handleSubmit = async (e, shouldClear = false) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError("Lütfen bir QR Kod değeri girin");
      return;
    }

    // Yıldız (*) karakterlerini tire (-) ile değiştir
    const formattedInput = inputText.trim().replace(/\*/g, "-");

    setQrCode(formattedInput);
    setError(null);
    setLoading(true);

    try {
      // Formatlanmış QR kodu değerini URL parametresi olarak kullan ve JWT token ekle
      const response = await axios.get(
        `https://tourniquet.vialand.com/tourniquet/tourniquet/all-addon?uid=${encodeURIComponent(
          formattedInput
        )}`,
        {
          headers: {
            Authorization: `bearer ${jwtToken}`,
          },
        }
      );

      setApiResponse(response.data);
      console.log("API yanıtı:", response.data);

      // API'den dönen verileri işleme
      if (response.data.isSuccess && response.data.data) {
        setItems(response.data.data);
        // API'den dönen kullanılmış öğeleri tanımlama
        const alreadyUsedItems = response.data.data
          .filter((item) => item.isUsed)
          .map((item) => item.orderId);
        setUsedItems(alreadyUsedItems);
      } else {
        setError(response.data.message || "Veri alınamadı");
      }
    } catch (err) {
      console.error("API hatası:", err);
      setError(`API hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }

    if (shouldClear) {
      setInputText("");
    }
  };

  const handleUseItem = async (orderId, value) => {
    try {
      // Add item to processing state
      setProcessingItems([...processingItems, orderId]);

      // Make POST request to mark item as used
      const response = await axios.post(
        "https://tourniquet.vialand.com/tourniquet/tourniquet/use-addon",
        {
          orderId: orderId,
          uid: value,
        },
        {
          headers: {
            Authorization: `bearer ${jwtToken}`,
          },
        }
      );

      if (response.data.isSuccess) {
        // Update local state only if API call was successful
        setUsedItems([...usedItems, orderId]);
        console.log(`${orderId} kullanıldı: API yanıtı:`, response.data);
      } else {
        setError(response.data.message || "İşlem başarısız oldu");
        console.error("API hatası:", response.data);
      }
    } catch (err) {
      console.error("Kullanım hatası:", err);
      setError(`API hatası: ${err.message}`);
    } finally {
      // Remove the item from processing state
      setProcessingItems(processingItems.filter((id) => id !== orderId));
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setInputText("");
    setQrCode("");
    setError(null);
    setApiResponse(null);
    setItems([]);

    // Doğrudan focus yapma, setTimeout'e gerek yok
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex justify-center mb-6">
        <Image
          src="/logo.png"
          width={200}
          height={200}
          alt="Logo"
          className="mx-auto"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {userName ? userName.toUpperCase() : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form
              onSubmit={(e) => handleSubmit(e, false)}
              className="flex justify-center items-center gap-4"
            >
              <Input
                ref={inputRef}
                type="text"
                placeholder="QR Kodu okutunuz"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full py-6 text-center text-lg"
              />
              <Button
                type="button"
                className="w-fit py-6 bg-red-700"
                size="lg"
                onClick={handleClear}
              >
                Sıfırla
              </Button>
            </form>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && <div className="text-center py-4">Yükleniyor...</div>}

            {qrCode && items.length > 0 && (
              <div className="grid grid-cols-1 gap-4 mt-4">
                {items.map((item, index) => (
                  <Card
                    key={index}
                    className={`${
                      usedItems.includes(item.orderId)
                        ? "opacity-50 bg-gray-100"
                        : "bg-gradient-to-r from-orange-100 to-amber-100 hover:shadow-lg transition-all duration-300"
                    }`}
                  >
                    <CardContent className="flex justify-between items-center p-6">
                      <span className="text-lg font-medium text-orange-800">
                        {item.label}
                      </span>
                      <Button
                        className={`${
                          usedItems.includes(item.orderId)
                            ? "bg-gray-400"
                            : "bg-orange-500 hover:bg-orange-600"
                        } text-white font-semibold px-6 py-2 rounded-full transition-colors duration-300`}
                        onClick={() => handleUseItem(item.orderId, item.value)}
                        disabled={
                          usedItems.includes(item.orderId) ||
                          processingItems.includes(item.orderId)
                        }
                      >
                        {usedItems.includes(item.orderId)
                          ? "Kullanıldı"
                          : processingItems.includes(item.orderId)
                          ? "İşleniyor..."
                          : "Kullan"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRTextInputDashboard;
