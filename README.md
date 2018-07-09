A package to dynamically measure sound input level in React Native applications.
Can be used to help user to adjust microphone sensitivity.

### Installation

Install the npm package and link it to your project:

```
npm install react-native-sound-level --save
react-native link react-native-sound-level
```

On *iOS* you need to add a usage description to `Info.plist`:

```
<key>NSMicrophoneUsageDescription</key>
<string>This sample uses the microphone to analyze sound level.</string>
```

On *Android* you need to add a permission to `AndroidManifest.xml`:

```
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```


### Usage

```
import RNSoundLevel from 'react-native-sound-level'

componentDidMount() {
  RNSoundLevel.start()
  RNSoundLevel.onNewFrame = (data) => {
    console.log('Sound level info', data)
  }
}

// don't forget to stop it
componentWillUnmount() {
  RNSoundLevel.stop()
}
```
