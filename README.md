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

### Installation on Ubuntu
1. Add to package.json: `"desktopExternalModules": [ "node_modules/react-native-sound-level/desktop" ]`
2. You may need to make QT's multimedia library accessible for linker
`sudo ln -s $YOUR_QT_DIR/5.9.1/gcc_64/lib/libQt5Multimedia.so /usr/local/lib/libQt5Multimedia.so`


### React Native 0.60+
To make it run correctly on iOS you may need the following:
1. Add `pod 'react-native-sound-level', :podspec => '../node_modules/react-native-sound-level/RNSoundLevel.podspec'` to your `ios/Podfile` file.
2. Unlink the library if linked before (`react-native unlink react-native-sound-level`).
3. Run `pod install` from within your project `ios` directory


### Usage

```js
import RNSoundLevel from 'react-native-sound-level'

componentDidMount() {
  // Its worth noting here that you can pass a number into `start()` to determin the sample rate. 
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
