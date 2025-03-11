// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Camera as CameraIcon } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import jsQR from "jsqr";
// import Image from "next/image";

// const items1 = ["Sıcak İçecek", "Burger Menü", "Patates Kızartması"];

// const items2 = ["Fotoğraf", "Video"];

// const QRScannerDashboard = () => {
//   const [scanning, setScanning] = useState(false);
//   const [hasCamera, setHasCamera] = useState(false);
//   const [qrCode, setQrCode] = useState("");
//   const [error, setError] = useState(null);
//   const [usedItems, setUsedItems] = useState([]);
//   const userName = localStorage.getItem("userName");
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   useEffect(() => {
//     checkCamera();
//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const checkCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });
//       stream.getTracks().forEach((track) => track.stop());
//       setHasCamera(true);
//     } catch (err) {
//       setError("Kamera erişimi sağlanamadı");
//       setHasCamera(false);
//     }
//   };

//   const startScanning = async () => {
//     try {
//       setError(null);
//       setQrCode("");
//       setScanning(true);

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });

//       streamRef.current = stream;
//       videoRef.current.srcObject = stream;
//       videoRef.current.play();

//       requestAnimationFrame(scanQRCode);
//     } catch (err) {
//       setError("Kamera başlatılamadı: " + err.message);
//       setScanning(false);
//     }
//   };

//   const stopScanning = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//     }
//     setScanning(false);
//   };

//   const scanQRCode = () => {
//     if (!videoRef.current || !scanning) return;

//     const video = videoRef.current;
//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     if (video.videoWidth === 0) {
//       requestAnimationFrame(scanQRCode);
//       return;
//     }

//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//     const code = jsQR(imageData.data, imageData.width, imageData.height);

//     if (code) {
//       setQrCode(code.data);
//       stopScanning();
//     } else if (scanning) {
//       requestAnimationFrame(scanQRCode);
//     }
//   };

//   const capturePhoto = () => {
//     if (!videoRef.current || !scanning) return;

//     const video = videoRef.current;
//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//     const code = jsQR(imageData.data, imageData.width, imageData.height);

//     if (code) {
//       setQrCode(code.data);
//       setError(null);
//       stopScanning();
//     } else {
//       setError("QR Kod bulunamadı. Lütfen tekrar deneyin.");
//     }
//   };

//   const handleUseItem = (item) => {
//     setUsedItems([...usedItems, item]);
//     console.log(`${item} kullanıldı`);
//   };

//   return (
//     <div className="container mx-auto p-4 max-w-md">
//       <div className="flex justify-center mb-6">
//         <Image
//           src="/logo.png"
//           width={200}
//           height={200}
//           alt="Logo"
//           className="mx-auto"
//         />
//       </div>
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold text-center">
//             Müessese {userName.toUpperCase()}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {hasCamera && scanning ? (
//               <div className="relative border rounded-lg overflow-hidden aspect-square">
//                 <video
//                   ref={videoRef}
//                   className="absolute top-0 left-0 w-full h-full object-cover"
//                   playsInline
//                 />
//                 <Button
//                   onClick={capturePhoto}
//                   className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
//                   size="lg"
//                 >
//                   <CameraIcon className="mr-2" />
//                   Fotoğraf Çek
//                 </Button>
//               </div>
//             ) : (
//               <Button
//                 onClick={startScanning}
//                 className="w-full py-6"
//                 size="lg"
//                 disabled={!hasCamera}
//               >
//                 <CameraIcon className="mr-2" />
//                 QR Kod Tara
//               </Button>
//             )}

//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             {qrCode && (
//               <div className="grid grid-cols-1 gap-4 mt-4">
//                 {userName === "vikingburger" &&
//                   items1.map((item, index) => (
//                     <Card
//                       key={index}
//                       className={`${
//                         usedItems.includes(item)
//                           ? "opacity-50 bg-gray-100"
//                           : "bg-gradient-to-r from-orange-100 to-amber-100 hover:shadow-lg transition-all duration-300"
//                       }`}
//                     >
//                       <CardContent className="flex justify-between items-center p-6">
//                         <span className="text-lg font-medium text-orange-800">
//                           {item}
//                         </span>
//                         <Button
//                           className={`${
//                             usedItems.includes(item)
//                               ? "bg-gray-400"
//                               : "bg-orange-500 hover:bg-orange-600"
//                           } text-white font-semibold px-6 py-2 rounded-full transition-colors duration-300`}
//                           onClick={() => handleUseItem(item)}
//                           disabled={usedItems.includes(item)}
//                         >
//                           {usedItems.includes(item) ? "Kullanıldı" : "Kullan"}
//                         </Button>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 {userName === "fotografci" &&
//                   items2.map((item, index) => (
//                     <Card
//                       key={index}
//                       className={`${
//                         usedItems.includes(item)
//                           ? "opacity-50 bg-gray-100"
//                           : "bg-gradient-to-r from-blue-100 to-purple-100 hover:shadow-lg transition-all duration-300"
//                       }`}
//                     >
//                       <CardContent className="flex justify-between items-center p-6">
//                         <span className="text-lg font-medium text-blue-800">
//                           {item}
//                         </span>
//                         <Button
//                           className={`${
//                             usedItems.includes(item)
//                               ? "bg-gray-400"
//                               : "bg-blue-500 hover:bg-blue-600"
//                           } text-white font-semibold px-6 py-2 rounded-full transition-colors duration-300`}
//                           onClick={() => handleUseItem(item)}
//                           disabled={usedItems.includes(item)}
//                         >
//                           {usedItems.includes(item) ? "Kullanıldı" : "Kullan"}
//                         </Button>
//                       </CardContent>
//                     </Card>
//                   ))}
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default QRScannerDashboard;
