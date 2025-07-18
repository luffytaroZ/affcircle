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
  
  // Calculate durations
  const titleDuration = Math.floor(fps * 2); // 2 seconds
  const contentDuration = Math.floor(fps * (duration - 4)); // duration - 4 seconds for intro/outro
  const outroDuration = Math.floor(fps * 2); // 2 seconds
  
  // Animations
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
      {/* Title Sequence */}
      <Sequence from={0} durationInFrames={titleDuration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif',
              maxWidth: '80%',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Content Sequence */}
      <Sequence from={titleDuration} durationInFrames={contentDuration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: contentOpacity,
            padding: '60px',
          }}
        >
          {images.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Img
                src={images[0]}
                style={{
                  width: '600px',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '40px',
                }}
              />
              {text && (
                <p
                  style={{
                    fontSize: 32,
                    color: '#4a4a4a',
                    textAlign: 'center',
                    maxWidth: '800px',
                    lineHeight: 1.4,
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  {text}
                </p>
              )}
            </div>
          ) : (
            <p
              style={{
                fontSize: 48,
                color: '#4a4a4a',
                textAlign: 'center',
                maxWidth: '80%',
                lineHeight: 1.4,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {text}
            </p>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Outro Sequence */}
      <Sequence from={titleDuration + contentDuration} durationInFrames={outroDuration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#6c757d',
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            Thank you for watching
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};