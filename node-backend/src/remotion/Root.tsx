import React from 'react';
import { Composition } from 'remotion';
import { MinimalTheme } from './compositions/MinimalTheme';
import { CorporateTheme } from './compositions/CorporateTheme';
import { StorytellingTheme } from './compositions/StorytellingTheme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MinimalTheme"
        component={MinimalTheme}
        durationInFrames={450} // 15 seconds at 30fps (will be dynamic)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Sample Title',
          text: 'Sample content text',
          images: [],
          duration: 15
        }}
      />
      <Composition
        id="CorporateTheme"
        component={CorporateTheme}
        durationInFrames={450} // 15 seconds at 30fps (will be dynamic)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Sample Title',
          text: 'Sample content text',
          images: [],
          duration: 15
        }}
      />
      <Composition
        id="StorytellingTheme"
        component={StorytellingTheme}
        durationInFrames={450} // 15 seconds at 30fps (will be dynamic)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Sample Title',
          text: 'Sample content text',
          images: [],
          duration: 15
        }}
      />
    </>
  );
};