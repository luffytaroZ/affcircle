import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from 'remotion';

export interface ThemeProps {
  title: string;
  text: string;
  images: string[];
  duration: number;
}

export const MinimalTheme: React.FC<ThemeProps> = ({ title, text, images = [], duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Ensure duration is a valid number with fallback
  const safeDuration = typeof duration === 'number' && isFinite(duration) && duration > 0 ? duration : 15;
  
  // Calculate durations with safety checks
  const titleDuration = Math.floor(fps * 2); // 2 seconds
  const contentDuration = Math.max(Math.floor(fps * (safeDuration - 4)), fps); // minimum 1 second, safeDuration - 4 seconds for intro/outro
  const outroDuration = Math.floor(fps * 2); // 2 seconds
  
  // Debug: Log values to see what's happening
  console.log('MinimalTheme props:', { title, text, images, duration, safeDuration, titleDuration, contentDuration, outroDuration, frame });
  
  // Simple animations
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const titleScale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const contentOpacity = interpolate(
    frame,
    [titleDuration, titleDuration + 30],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      {/* Always visible title */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 72,
          fontWeight: 'bold',
          color: '#1a1a1a',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          opacity: 1, // Always visible
          zIndex: 10,
        }}
      >
        {title || 'NO TITLE PROVIDED'}
      </div>
      
      {/* Always visible text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 32,
          color: '#4a4a4a',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          opacity: 1, // Always visible
          zIndex: 10,
        }}
      >
        {text || 'NO TEXT PROVIDED'}
      </div>
      
      {/* Debug info */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          fontSize: 16,
          color: '#ff0000',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '10px',
          zIndex: 20,
        }}
      >
        Frame: {frame} | Duration: {safeDuration}s | Title: {title ? 'YES' : 'NO'} | Text: {text ? 'YES' : 'NO'}
      </div>
    </AbsoluteFill>
  );
};