"use client";
import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

export default function MinimalQRScanner() {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  async function startScanning() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      intervalRef.current = setInterval(scanFrame, 500);
    } catch (e) {
      setError("Kamera başlatılamadı: " + e.message);
    }
  }

  function stopScanning() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  }

  function scanFrame() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      setQrCode(code.data);
      stopScanning();
    }
  }

  return (
    <div className="text-center m-auto">
      {qrCode && <p>QR: {qrCode}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <video ref={videoRef} />
    </div>
  );
}
