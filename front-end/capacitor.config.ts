import type { CapacitorConfig } from '@capacitor/cli';

const isDev = true;

const config: CapacitorConfig = {
  appId: 'com.gametracker.app',
  appName: 'GameTracker',
  webDir: 'dist/front-end/browser',
  server: isDev ? {
    url:'http://192.168.1.134:4200/',
    cleartext: true
  } : {
    androidScheme: 'https'
  }
};

export default config;