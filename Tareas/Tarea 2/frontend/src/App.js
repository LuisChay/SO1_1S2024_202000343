import React, { useRef, useState } from 'react';
import './App.css';

const startCamera = (videoRef) => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      videoRef.current.srcObject = stream;
    })
    .catch(error => {
      console.error('Error accessing the camera:', error);
    });
};

const takePhoto = async (videoRef) => {
  const canvas = document.createElement('canvas');
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoRef.current, 0, 0);

  // Comprimir la imagen antes de codificar en base64
  const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Ajusta la calidad según tus necesidades

  const photoData = {
    image: compressedDataUrl,
    timestamp: new Date().toISOString() // Obtener la fecha y hora actual en formato ISO
  };
  console.log('Datos de la foto:', photoData);
  try {
    // Enviar solo la referencia a la API y guardar la imagen en el servidor
    const response = await fetch('http://localhost:5000/insertarfoto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: photoData.image, timestamp: photoData.timestamp})
    });

    const responseData = await response.json();
    console.log('Respuesta del servidor:', responseData);
    window.alert('Foto tomada y enviada con éxito');
  } catch (error) {
    console.error('Error al enviar la foto:', error);
    window.alert('Error al enviar la foto');
  }
};

const CameraApp = () => {
  const videoRef = useRef(null);

  return (
    <div>
      <h1>Tarea 2 - SO1 - 1S2024</h1>
      <div>
        <button onClick={() => startCamera(videoRef)}>Iniciar cámara</button>
        <button onClick={() => takePhoto(videoRef)}>Tomar foto</button>
      </div>
      <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '400px' }} />
    </div>
  );
};

export default CameraApp;
