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

export const StorytellingTheme: React.FC<ThemeProps> = ({ title, text, images, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate durations
  const titleDuration = Math.floor(fps * 2.5); // 2.5 seconds
  const contentDuration = Math.floor(fps * (duration - 5)); // duration - 5 seconds for intro/outro
  const outroDuration = Math.floor(fps * 2.5); // 2.5 seconds
  
  // Animations
  const titleOpacity = interpolate(frame, [0, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const titleY = interpolate(frame, [0, 45], [50, 0], {
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

  // Split text into words for animated reveal
  const words = text.split(' ');
  const wordsPerSecond = 3;
  const wordDelay = fps / wordsPerSecond;

  return (
    <AbsoluteFill style={{ backgroundColor: '#7c2d92' }}>
      {/* Storytelling background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, #7c2d92 0%, #c084fc 50%, #7c2d92 100%)',
        }}
      />
      
      {/* Decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          filter: 'blur(3px)',
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
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 24,
                color: '#e879f9',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'italic',
                marginBottom: '20px',
              }}
            >
              Once upon a time...
            </div>
            <h1
              style={{
                fontSize: 68,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
                maxWidth: '80%',
                lineHeight: 1.3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: contentOpacity,
            padding: '60px',
          }}
        >
          {images.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  marginBottom: '40px',
                }}
              >
                <Img
                  src={images[0]}
                  style={{
                    width: '700px',
                    height: '450px',
                    objectFit: 'cover',
                    borderRadius: '20px',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '-15px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#e879f9',
                    boxShadow: '0 5px 15px rgba(232, 121, 249, 0.4)',
                  }}
                />
              </div>
              {text && (
                <div style={{ textAlign: 'center', maxWidth: '800px' }}>
                  <p
                    style={{
                      fontSize: 36,
                      color: '#ffffff',
                      lineHeight: 1.5,
                      fontFamily: 'Arial, sans-serif',
                      fontStyle: 'italic',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {words.map((word, index) => {
                      const wordFrame = frame - titleDuration - (index * wordDelay);
                      const wordOpacity = interpolate(wordFrame, [0, 15], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      });
                      
                      return (
                        <span
                          key={index}
                          style={{
                            opacity: wordOpacity,
                            display: 'inline-block',
                            marginRight: '8px',
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', maxWidth: '80%' }}>
              <p
                style={{
                  fontSize: 46,
                  color: '#ffffff',
                  lineHeight: 1.5,
                  fontFamily: 'Arial, sans-serif',
                  fontStyle: 'italic',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {words.map((word, index) => {
                  const wordFrame = frame - titleDuration - (index * wordDelay);
                  const wordOpacity = interpolate(wordFrame, [0, 15], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
                  
                  return (
                    <span
                      key={index}
                      style={{
                        opacity: wordOpacity,
                        display: 'inline-block',
                        marginRight: '8px',
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
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
                fontSize: 28,
                color: '#e879f9',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'italic',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              ...and they lived happily ever after.
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};