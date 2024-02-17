import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.transcriber.app',
  appName: 'transcriber',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
}

export default config
