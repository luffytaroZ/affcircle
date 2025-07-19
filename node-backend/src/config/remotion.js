const { bundle } = require('@remotion/bundler');
const path = require('path');

let bundleLocation;

// Bundle Remotion project (do this once at startup)
const initRemotionBundle = async () => {
  try {
    console.log('🎬 Bundling Remotion project...');
    bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '../remotion/index.ts'),
      onProgress: (progress) => {
        console.log(`Bundling progress: ${Math.round(progress * 100)}%`);
      },
    });
    console.log('✅ Remotion bundle created at:', bundleLocation);
    return bundleLocation;
  } catch (error) {
    console.error('❌ Error bundling Remotion project:', error);
    throw error;
  }
};

const getBundleLocation = () => bundleLocation;

module.exports = {
  initRemotionBundle,
  getBundleLocation
};