import React from 'react';
import { Composition } from 'remotion';
import { MinimalTheme } from './compositions/MinimalTheme';
import { CorporateTheme } from './compositions/CorporateTheme';
import { StorytellingTheme } from './compositions/StorytellingTheme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="minimal"
        component={MinimalTheme}
        durationInFrames={450} // 15 seconds at 30fps
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
        id="corporate"
        component={CorporateTheme}
        durationInFrames={450} // 15 seconds at 30fps
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
        id="storytelling"
        component={StorytellingTheme}
        durationInFrames={450} // 15 seconds at 30fps
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