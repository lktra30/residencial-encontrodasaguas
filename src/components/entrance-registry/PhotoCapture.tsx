import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface PhotoCaptureProps {
  onPhotoCapture: (photoFile: File) => void;
  resetTrigger?: boolean;
}

export function PhotoCapture({ onPhotoCapture, resetTrigger }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Definindo dimensões constantes para vídeo e foto
  const VIDEO_WIDTH = 640;
  const VIDEO_HEIGHT = 480;

  const getVideo = () => {
    navigator.mediaDevices.getUserMedia({
      video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT }
    })
    .then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Erro ao iniciar vídeo:", err);
            setError("Erro ao iniciar câmera.");
          }
        });
      }
    })
    .catch((err) => {
      console.error("Erro ao acessar câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    });
  }
  
  const takePhoto = () => {
    const video = videoRef.current;
    const photo = photoRef.current;

    if (!video || !photo) return;

    // Mantendo as mesmas dimensões do vídeo
    photo.width = VIDEO_WIDTH;
    photo.height = VIDEO_HEIGHT;

    const ctx = photo.getContext('2d');
    if (!ctx) return;
    
    // Desenhando a imagem com as mesmas dimensões
    ctx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    setHasPhoto(true);
    
    // Converter para string base64
    const photoData = photo.toDataURL('image/jpeg', 0.95);
    
    // Converter base64 para Blob
    const binaryString = atob(photoData.split(',')[1]);
    const array = [];
    for (let i = 0; i < binaryString.length; i++) {
      array.push(binaryString.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    
    // Criar arquivo a partir do Blob
    const fileName = `photo_${new Date().getTime()}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    // Enviar o arquivo para o callback
    onPhotoCapture(file);
    
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
      // Guardar referência para o stream atual para evitar problemas com ref mutável
      const currentVideo = videoRef.current;
      if (currentVideo && currentVideo.srcObject) {
        const tracks = (currentVideo.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Efeito que observa mudanças no resetTrigger
  useEffect(() => {
    if (resetTrigger !== undefined) {
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
            className="w-full object-cover"
            style={{ maxWidth: `${VIDEO_WIDTH}px`, maxHeight: `${VIDEO_HEIGHT}px` }}
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
        <div className="flex items-center justify-center overflow-hidden rounded-md border bg-muted">
          <canvas 
            ref={photoRef}
            className="object-cover"
            style={{ maxWidth: `${VIDEO_WIDTH}px`, maxHeight: `${VIDEO_HEIGHT}px` }}
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