# Changelog

## 1.4.0

Compatibility release: the library now works on current React Native versions
(tested against RN 0.86), including the New Architecture / bridgeless mode.

### Fixed

- **iOS: no `frame` events on RN 0.82+.** The module now extends
  `RCTEventEmitter` instead of using the removed bridge event dispatcher.
- **`start(config)` object form was ignored.** `monitorInterval` and
  `samplingRate` passed as an object now actually apply (#18).
- **Android: crash on stop.** The metering timer no longer races `stop()`
  into an `IllegalStateException` on a released `MediaRecorder` (#22, #12, #15).
- **Android: AGP 8 build failures.** Added `namespace` with a dual-manifest
  setup, compileSdk 35 fallback and `rootProject.ext` version support (#26).
- **Android: storage leak.** The temporary recording file is now deleted when
  monitoring stops (and any stale file is replaced on start) instead of being
  left to grow in the app cache directory forever.
- **Android: wrong dB scale.** The decibel conversion used the natural
  logarithm instead of log10; `value` is now proper dBFS, consistent with iOS.
- **iOS: metering froze while scrolling lists** — the timer now runs in
  `NSRunLoopCommonModes` (#29).
- **iOS: audio session conflicts.** Switched from `MultiRoute` to
  `PlayAndRecord` with `MixWithOthers`, and the session is released with
  `NotifyOthersOnDeactivation` on stop instead of forcing the `Playback`
  category onto the host app (#30). `AllowBluetooth` enables headset
  microphones (#31).
- `index.d.ts`: `monitoringInterval` renamed to `monitorInterval` (the name
  the code actually reads).

### Added

- `allowHapticsAndSystemSoundsDuringRecording` option (iOS 13+), thanks
  @alessioemireni (#32).
- iOS `start()`/`stop()` now return promises and reject with the same error
  codes as Android.
- The Android `RECORD_AUDIO` permission is merged into consuming apps via the
  library manifest (runtime request still required).
- README: documented the dBFS scale (#1, #2, #20), the
  permission-not-granted symptom (#11) and background monitoring (#4).

### Changed

- Deprecated `NativeAppEventEmitter` replaced with
  `NativeEventEmitter`/`DeviceEventEmitter`.
- iOS `start()` now rejects with `INVALID_STATE` when already monitoring,
  matching Android.
- Podspec: minimum iOS version raised to 12.0, dependency changed from the
  deprecated `React` umbrella pod to `React-Core`.
- Android: minSdk fallback raised to 24 (RN 0.86 minimum).
