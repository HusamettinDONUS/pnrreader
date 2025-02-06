"use client";

import React, { useState } from "react";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

function App() {
  const [dataUri, setDataUri] = useState("");

  function handleTakePhoto(dataUri) {
    setDataUri(dataUri);
  }

  return (
    <div>
      <Camera
        onTakePhoto={handleTakePhoto}
        idealFacingMode={FACING_MODES.ENVIRONMENT} // Use the rear camera
        imageType={IMAGE_TYPES.JPG}
      />
      {dataUri && <img src={dataUri} alt="Captured" />}
    </div>
  );
}

export default App;
