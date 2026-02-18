import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gametracker.app',
  appName: 'GameTracker',
  webDir: 'dist/front-end/browser',
  server: {
    url: 'http://192.168.1.100:4200',
    cleartext: true
  }
};

export default config;