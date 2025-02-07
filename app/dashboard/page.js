"use client";

import React, { useState, useEffect } from "react";
import { Camera as CameraIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import jsQR from "jsqr";
import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

const QRScannerDashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    checkCamera();
  }, []);

  const checkCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasCamera(true);
    } catch (err) {
      setError("Kamera erişimi sağlanamadı");
      setHasCamera(false);
    }
  };

  const handleTakePhoto = (dataUri) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext("2d");
      context.drawImage(img, 0, 0);
      const imageData = context.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, img.width, img.height);

      if (code) {
        setError(null);
        setQrCode(code.data);
        setScanning(false);
      } else {
        setError("QR Kod bulunamadı. Lütfen tekrar deneyin.");
      }
    };
    img.src = dataUri;
  };

  const startScanning = () => {
    setError(null);
    setQrCode("");
    setScanning(true);
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            QR Kod Tarayıcı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hasCamera && scanning ? (
              <div className="relative border rounded-lg aspect-square">
                <Camera
                  onTakePhoto={handleTakePhoto}
                  idealFacingMode="environment"
                  imageType="jpg"
                  isSilentMode
                />
              </div>
            ) : (
              <Button
                onClick={startScanning}
                className="w-full py-6"
                size="lg"
                disabled={!hasCamera}
              >
                <CameraIcon className="mr-2" />
                QR Kod Tara
              </Button>
            )}

            {qrCode && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Taranan QR Kod:</h3>
                <p className="text-lg break-all">{qrCode}</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScannerDashboard;
