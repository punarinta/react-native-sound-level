# react-native-sound-level

A package to dynamically measure sound input level in React Native applications.
Can be used to help user to adjust microphone sensitivity.

Works with current React Native versions, including the New Architecture
(via the built-in interop layer). Requires RN 0.60+ for autolinking.

### Installation

Install the npm package:

```
npm i react-native-sound-level --save
```

On *iOS* you need to add a usage description to `Info.plist`:

```
<key>NSMicrophoneUsageDescription</key>
<string>This sample uses the microphone to analyze sound level.</string>
```

On *Android* the `RECORD_AUDIO` permission is merged into your app's manifest
automatically. You still need to request the permission from the user at runtime
(see Usage below).

### Usage

1. Request permission to access microphone, handle the UI by yourself.
You may use [react-native-permissions](https://www.npmjs.com/package/react-native-permissions) package or simply
[PermissionsAndroid](https://reactnative.dev/docs/permissionsandroid) module.
2. Configure the monitor and start it.
3. Makes sense to stop it when not used.

```ts
import RNSoundLevel from 'react-native-sound-level'

const MONITOR_INTERVAL = 250 // in ms

const requestPermission = async () => {
  // request permission to access microphone
  // ...
  if (success) {
    // start monitoring
    RNSoundLevel.start()

    // you may also specify a monitor interval (default is 250ms)
    RNSoundLevel.start(MONITOR_INTERVAL)

    // or add even more options
    RNSoundLevel.start({
      monitorInterval: MONITOR_INTERVAL,
      samplingRate: 16000, // default is 22050
      allowHapticsAndSystemSoundsDuringRecording: true, // iOS 13+ only, default is false
    })
  }
}

useEffect(() => {
  RNSoundLevel.onNewFrame = (data) => {
    // see "Returned data" section below
    console.log('Sound level info', data)
  }

  return () => {
    // don't forget to stop it
    RNSoundLevel.stop()
  }
}, [])
```

### Returned data

```
{
  "id",             // frame number
  "value",          // sound level in dBFS, see "Understanding the values"
  "rawValue"        // raw level value, OS-dependent
}
```

### Understanding the values

`value` is expressed in **dBFS** (decibels relative to full scale): `0` is the
maximum level the microphone can deliver and `-160` is silence. It is **not**
an absolute dB SPL reading — a phone microphone is not calibrated for that, so
this library cannot tell you that a sound is "50 dB loud". It is well suited
for relative measurements: level meters, voice activity indication, adjusting
microphone sensitivity and similar tasks.

On Android `rawValue` is the maximum PCM amplitude since the previous frame
(0..32767, i.e. the range of signed 16-bit audio). On iOS `rawValue` equals
`value`.

**Getting constant `value: -160, rawValue: 0`?** This almost always means the
microphone permission was not granted. Request `RECORD_AUDIO` (Android) at
runtime and make sure `NSMicrophoneUsageDescription` is present (iOS) — on
current React Native versions `start()` rejects with a descriptive error code
in this case, so check its rejection too.

### Monitoring in background

The library keeps measuring only while the OS lets your app record:

- **iOS**: add the `audio` background mode to `Info.plist`
  (`UIBackgroundModes` → `audio`), otherwise recording is suspended shortly
  after the app goes to background.
- **Android**: run a foreground service while monitoring. Starting with
  Android 14 (API 34) the service must declare
  `android:foregroundServiceType="microphone"` and your app needs the
  `FOREGROUND_SERVICE_MICROPHONE` permission. Note that Android does not allow
  *starting* microphone access from the background — start monitoring while
  the app is in the foreground.

### Manual installation on iOS (no autolinking)

```
In XCode, in the project navigator:

* Right click _Libraries_
* Add Files to _[your project's name]_
* Go to `node_modules/react-native-sound-level`
* Add the `.xcodeproj` file

In XCode, in the project navigator, select your project.

* Add the `libRNSoundLevel.a` from the _soundlevel_ project to your project's _Build Phases ➜ Link Binary With Libraries_
```

### Installation on Ubuntu (react-native-desktop)

> ⚠️ The Qt-based `react-native-desktop` project is no longer maintained
> upstream; the desktop module is kept as-is and is not actively supported.

1. Add to package.json: `"desktopExternalModules": [ "node_modules/react-native-sound-level/desktop" ]`
2. You may need to make QT's multimedia library accessible for linker
`sudo ln -s $YOUR_QT_DIR/5.9.1/gcc_64/lib/libQt5Multimedia.so /usr/local/lib/libQt5Multimedia.so`
