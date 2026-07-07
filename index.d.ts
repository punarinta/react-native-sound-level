export type SoundLevelResult = {
  /**
   * Frame number
   */
  id: number;

  /**
   * Sound level in dBFS (decibels relative to full scale)
   *
   * @note 0 is the maximum, -160 is silence
   */
  value: number;

  /**
   * Raw level value, OS-dependent
   */
  rawValue: number;
}

export type SoundLevelMonitorConfig = {
  /**
   * How often a frame is delivered, in ms. Default is 250.
   */
  monitorInterval?: number

  /**
   * Recording sampling rate in Hz. Default is 22050.
   */
  samplingRate?: number

  /**
   * iOS only: keep haptics and system sounds enabled while recording.
   * Default is false. Has effect on iOS 13+.
   */
  allowHapticsAndSystemSoundsDuringRecording?: boolean
}

export type SoundLevelType = {
  /**
   * Start monitoring sound level
   *
   * @note config is not supported for desktop yet
   *
   * @note don't forget to call `stop` eventually
   *
   * @throws
   *  - `INVALID_STATE` - sound level recording already started
   *  - `COULDNT_CONFIGURE_MEDIA_RECORDER` - recording configuration failed (probably due-to lack of android.permission.RECORD_AUDIO or NSMicrophoneUsageDescription)
   *  - `COULDNT_PREPARE_RECORDING` - preparation fails for some reason
   *  - `COULDNT_START_RECORDING` - can't start recording session (another app is using recording?)
   *  - `COULDNT_CONFIGURE_AUDIO_SESSION` (iOS) - audio session category configuration failed
   *  - `COULDNT_ACTIVATE_AUDIO_SESSION` (iOS) - audio session activation failed
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
