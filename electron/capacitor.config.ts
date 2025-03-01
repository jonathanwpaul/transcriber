import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.transcriber.app',
  appName: 'transcriber',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Electron: {
      electronConfig: {
        main: 'src/electron/main.ts',
      },
    },
  },
}

export default config
