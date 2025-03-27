import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void;
  resetTrigger?: boolean;
}

export function PhotoCapture({ onPhotoCapture, resetTrigger }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVideo = () => {
    navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    })
    .then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    })
    .catch((err) => {
      console.error("Erro ao acessar câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    });
  }
  
  const takePhoto = () => {
    const width = 480;
    const height = 480;
    
    const video = videoRef.current;
    const photo = photoRef.current;

    if (!video || !photo) return;

    photo.width = width;
    photo.height = height;

    const ctx = photo.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, width, height);
    setHasPhoto(true);
    
    // Converter para string base64 e enviar para o callback
    const photoData = photo.toDataURL('image/jpeg');
    onPhotoCapture(photoData);
    
    // Parar o stream da câmera quando a foto for tirada
    if (video.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  }

  const closePhoto = () => {
    const photo = photoRef.current;
    if (!photo) return;
    
    const ctx = photo.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, photo.width, photo.height);
    setHasPhoto(false);
    
    // Reiniciar câmera
    getVideo();
  }

  useEffect(() => {
    getVideo();
    
    // Limpar recursos ao desmontar
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Efeito que observa mudanças no resetTrigger
  useEffect(() => {
    if (resetTrigger) {
      setHasPhoto(false);
      getVideo();
    }
  }, [resetTrigger]);

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="text-sm text-red-500 p-2 border border-red-200 rounded bg-red-50">
          {error}
        </div>
      )}
      
      <div className={`relative ${hasPhoto ? 'hidden' : 'block'}`}>
        <div className="flex items-center justify-center overflow-hidden rounded-md border bg-muted">
          <video 
            ref={videoRef} 
            className="w-680 h-680 object-cover"
          />
        </div>
        <Button 
          type="button"
          onClick={takePhoto}
          className="mt-2 w-full"
        >
          <Camera className="mr-2 h-4 w-4" />
          Capturar Foto
        </Button>
      </div>
      
      <div className={`relative ${hasPhoto ? 'block' : 'hidden'}`}>
        <div className="w-full overflow-hidden rounded-md border bg-muted">
          <canvas 
            ref={photoRef}
            className="w-full h-64 object-cover"
          />
        </div>
        <Button 
          type="button"
          variant="outline"
          onClick={closePhoto}
          className="mt-2 w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Nova Foto
        </Button>
      </div>
    </div>
  );
}

export default PhotoCapture;