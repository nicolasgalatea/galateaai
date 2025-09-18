import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  text, 
  autoPlay = false,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const generateAudio = useCallback(async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: 'alloy'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.audioContent) {
        // Create audio element
        const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Set up event listeners
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
          const currentProgress = (audio.currentTime / audio.duration) * 100;
          setProgress(currentProgress);
        });

        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setProgress(0);
        });

        audio.addEventListener('pause', () => {
          setIsPlaying(false);
        });

        audio.addEventListener('play', () => {
          setIsPlaying(true);
        });

        // Auto play if requested
        if (autoPlay) {
          await audio.play();
        }

        toast({
          title: "Audio generado",
          description: data.provider === 'elevenlabs' 
            ? "Voz generada con ElevenLabs" 
            : "Voz generada con OpenAI",
        });
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el audio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [text, autoPlay, toast]);

  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) {
      await generateAudio();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        toast({
          title: "Error",
          description: "No se pudo reproducir el audio",
          variant: "destructive",
        });
      }
    }
  }, [isPlaying, generateAudio, toast]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleProgressClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickProgress = (clickX / rect.width) * 100;
    const newTime = (clickProgress / 100) * duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(clickProgress);
  }, [duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      {/* Play/Pause Button */}
      <Button
        onClick={togglePlayPause}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="flex-shrink-0"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* Progress Bar */}
      <div className="flex-1 space-y-1">
        <div 
          className="cursor-pointer"
          onClick={handleProgressClick}
        >
          <Progress 
            value={progress} 
            className="h-2"
          />
        </div>
        
        {duration > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Mute Button */}
      <Button
        onClick={toggleMute}
        variant="ghost"
        size="sm"
        className="flex-shrink-0"
        disabled={!audioRef.current}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};