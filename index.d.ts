export type SoundLevelResult = {
  /**
   * Frame number
   */
  id: number;

  /**
   * Sound level in decibels
   *
   * @note -160 is a silence
   */
  value: number;

  /**
   * Raw level value, OS-depended
   */
  rawValue: number;
}

export type SoundLevelMonitorConfig = {
  monitoringInterval?: number
  samplingRate?: number
}

export type SoundLevelType = {
  /**
   * Start monitoring sound level
   *
   * @note `monitoringInterval` is not supported for desktop yet
   *
   * @note don't forget to call `stop` eventually
   *
   * on Android:
   * @throws
   *  - `INVALID_STATE` - sound level recording already started
   *  - `COULDNT_CONFIGURE_MEDIA_RECORDER` - recording configuration failed (probably due-to lack of android.permission.RECORD_AUDIO)
   *  - `COULDNT_PREPARE_RECORDING` - preparation fails for some reason
   *  - `COULDNT_START_RECORDING` - can't start recording session (another app is using recording?)
   */
  start: (config?: number | SoundLevelMonitorConfig) => Promise<void>;
  /**
   * Stop monitoring sound level
   *
   * on Android:
   * @throws
   *  - `INVALID_STATE` - sound level recording hasn't been started
   *  - `RUNTIME_EXCEPTION` - no valid audio data received. You may be using a device that can't record audio.
   */
  stop: () => Promise<void>;
  /**
   * User-provided callback to call on each frame
  */
  onNewFrame: (result: SoundLevelResult) => void;
}

declare const SoundLevel: SoundLevelType;

export default SoundLevel;
