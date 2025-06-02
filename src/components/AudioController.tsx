import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Music, Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface AudioControllerProps {
  onSoundEffect?: (type: 'slider' | 'button' | 'success') => void;
}

export function AudioController({ onSoundEffect }: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  useEffect(() => {
    // Initialize Web Audio API for ambient background sound
    const initAudio = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gain = context.createGain();
        gain.connect(context.destination);
        gain.gain.value = volume[0] / 100 * 0.1; // Keep background very subtle
        
        setAudioContext(context);
        setGainNode(gain);
      } catch (error) {
        console.log('Web Audio API not supported');
      }
    };

    initAudio();

    return () => {
      if (oscillator) {
        oscillator.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = volume[0] / 100 * 0.1;
    }
  }, [volume, gainNode]);

  const toggleMusic = () => {
    if (!audioContext || !gainNode) return;

    if (isPlaying && oscillator) {
      oscillator.stop();
      setOscillator(null);
      setIsPlaying(false);
    } else {
      // Create a subtle ambient tone
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const filter = audioContext.createBiquadFilter();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(220, audioContext.currentTime); // A3
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(330, audioContext.currentTime); // E4
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      
      osc1.start();
      osc2.start();
      
      setOscillator(osc1);
      setIsPlaying(true);
    }
  };

  const playSound = (frequency: number, duration: number = 0.1) => {
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
  };

  useEffect(() => {
    if (onSoundEffect) {
      const handleSoundEffect = (type: 'slider' | 'button' | 'success') => {
        switch (type) {
          case 'slider':
            playSound(800, 0.05);
            break;
          case 'button':
            playSound(600, 0.1);
            break;
          case 'success':
            playSound(1000, 0.2);
            break;
        }
      };
      
      // Set up the sound effect callback
      (window as any).playSoundEffect = handleSoundEffect;
    }
  }, [onSoundEffect, audioContext]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20">
        <div className="flex items-center space-x-4">
          {/* Background Music Control */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMusic}
              className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-primary"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Music className="w-4 h-4" />}
            </Button>
            {isPlaying && (
              <div className="flex items-center">
                <div className="audio-wave"></div>
                <div className="audio-wave"></div>
                <div className="audio-wave"></div>
                <div className="audio-wave"></div>
                <div className="audio-wave"></div>
              </div>
            )}
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <VolumeX className="w-3 h-3 text-neutral" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-16"
            />
            <Volume2 className="w-3 h-3 text-neutral" />
          </div>
        </div>
      </div>
    </div>
  );
}
