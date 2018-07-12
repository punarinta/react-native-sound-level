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

### Manual installation on iOS
```
In XCode, in the project navigator:

* Right click _Libraries_
* Add Files to _[your project's name]_
* Go to `node_modules/react-native-sound-level`
* Add the `.xcodeproj` file

In XCode, in the project navigator, select your project.

* Add the `libRNSoundLevel.a` from the _soundlevel_ project to your project's _Build Phases ➜ Link Binary With Libraries_
```


### Usage

```js
import RNSoundLevel from 'react-native-sound-level'

componentDidMount() {
  RNSoundLevel.start()
  RNSoundLevel.onNewFrame = (data) => {
    // see "Returned data" section below
    console.log('Sound level info', data)
  }
}

// don't forget to stop it
componentWillUnmount() {
  RNSoundLevel.stop()
}
```

### Returned data
```
{
  "id",             // frame number
  "value",          // sound level in decibels, -160 is a silence level
  "rawValue"        // raw level value, OS-dependent
}
```
