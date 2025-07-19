import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
Config.setJpegQuality(8);
Config.setNumberOfGifLoops(0);