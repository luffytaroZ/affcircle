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

export const CorporateTheme: React.FC<ThemeProps> = ({ title, text, images, duration }) => {
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
  
  const slideInX = interpolate(frame, [0, 45], [-100, 0], {
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
    <AbsoluteFill style={{ backgroundColor: '#1e3a8a' }}>
      {/* Corporate background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        }}
      />
      
      {/* Title Sequence */}
      <Sequence from={0} durationInFrames={titleDuration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: titleOpacity,
            transform: `translateX(${slideInX}px)`,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '4px',
                backgroundColor: '#fbbf24',
                margin: '0 auto 20px',
              }}
            />
            <h1
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
                maxWidth: '80%',
                lineHeight: 1.2,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {title}
            </h1>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Content Sequence */}
      <Sequence from={titleDuration} durationInFrames={contentDuration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: contentOpacity,
            padding: '60px',
          }}
        >
          {images.length > 0 ? (
            <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <div style={{ flex: 1, marginRight: '60px' }}>
                <Img
                  src={images[0]}
                  style={{
                    width: '100%',
                    height: '500px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '4px solid #fbbf24',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: '40px',
                    height: '4px',
                    backgroundColor: '#fbbf24',
                    marginBottom: '20px',
                  }}
                />
                <p
                  style={{
                    fontSize: 32,
                    color: '#ffffff',
                    lineHeight: 1.6,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: '300',
                  }}
                >
                  {text}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', maxWidth: '80%' }}>
              <div
                style={{
                  width: '60px',
                  height: '4px',
                  backgroundColor: '#fbbf24',
                  margin: '0 auto 30px',
                }}
              />
              <p
                style={{
                  fontSize: 42,
                  color: '#ffffff',
                  lineHeight: 1.6,
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '300',
                }}
              >
                {text}
              </p>
            </div>
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
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '4px',
                backgroundColor: '#fbbf24',
                margin: '0 auto 20px',
              }}
            />
            <div
              style={{
                fontSize: 24,
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontWeight: '300',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Professional Excellence
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};