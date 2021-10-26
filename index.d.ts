import { NativeAppEventEmitter } from 'react-native'
export type SoundLevelResultType = {
  /**
   * @description Frame number
   */
  id: number;

  /**
   * @description Sound level in decibels
   * @description -160 is a silence
   */
  value: number;

  /**
   * @description raw level value, OS-depended
   */
  rawValue: number;
}

export type SoundLevelType = {
  /**
   * @description monitoringInterval works only for iOS
   */
  start: (monitoringInterval) => Promise<void>;
  stop: () => void;
  onNewFrame: (result: SoundLevelResultType) => void;
}

declare const SoundLevel: SoundLevelType;

export default SoundLevel;