"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "react-html5-camera-photo/build/css/index.css";
import { CheckCircle, XCircle, Camera as CameraIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import jsQR from "jsqr";

const Camera = dynamic(() => import("react-html5-camera-photo"), {
  ssr: false,
});

const QRScannerDashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [pnrCode, setPnrCode] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    checkCamera();
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  const checkCamera = async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Kamera API'si bu cihazda desteklenmiyor");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasCamera(true);
    } catch (err) {
      setError("Kamera erişimi sağlanamadı: " + err.message);
      setHasCamera(false);
    }
  };

  const startQRScanning = (videoElement) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    scanIntervalRef.current = setInterval(() => {
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          clearInterval(scanIntervalRef.current);
          handleQRCodeDetected(code.data);
        }
      }
    }, 100);
  };

  const handleQRCodeDetected = async (qrData) => {
    setPnrCode(qrData);
    try {
      const response = await verifyPNR(qrData);
      setStatus(response.success);
      setError(null);
      if (response.success) {
        setScanning(false);
      }
    } catch (err) {
      setStatus(false);
      setError(err.message);
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
        handleQRCodeDetected(code.data);
      } else {
        setError("QR Kod bulunamadı. Lütfen tekrar deneyin.");
        setStatus(false);
      }
    };
    img.src = dataUri;
  };

  const verifyPNR = async (pnr) => {
    // API çağrısı simülasyonu
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = /^[A-Z0-9]{6}$/.test(pnr);
        resolve({
          success: isValid,
          message: isValid ? "PNR doğrulandı" : "Geçersiz PNR formatı",
        });
      }, 500);
    });
  };

  const startScanning = async () => {
    try {
      setError(null);
      setStatus(null);
      setPnrCode("");
      setScanning(true);
    } catch (err) {
      setError("Kamera başlatılamadı: " + err.message);
      setScanning(false);
    }
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
            {!hasCamera && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Kamera Erişimi Yok</AlertTitle>
                <AlertDescription>
                  Lütfen kamera izinlerini kontrol edin ve tarayıcınızın kamera
                  erişimine izin verdiğinizden emin olun.
                </AlertDescription>
              </Alert>
            )}

            {hasCamera && scanning ? (
              <div className="relative border rounded-lg overflow-hidden aspect-square">
                <Camera
                  onTakePhoto={handleTakePhoto}
                  idealResolution={{ width: 1280, height: 720 }}
                  idealFacingMode="environment"
                  isImageMirror={false}
                  onCameraError={handleError}
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

            {pnrCode && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Taranan PNR Kodu:</h3>
                <p className="text-lg font-mono">{pnrCode}</p>
              </div>
            )}

            {status !== null && (
              <Alert variant={status ? "default" : "destructive"}>
                {status ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {status ? "Doğrulama Başarılı" : "Doğrulama Başarısız"}
                </AlertTitle>
                <AlertDescription>
                  {status
                    ? "PNR kodu başarıyla doğrulandı."
                    : error || "Geçersiz PNR kodu."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScannerDashboard;
