'use strict'

import { NativeModules, NativeAppEventEmitter, Platform } from 'react-native'

var SoundLevelModule =
  Platform.OS === 'desktop'
    ? NativeModules.RNSoundLevel
    : NativeModules.RNSoundLevelModule

var SoundLevel = {
  timer: null,
  start: function (monitorInterval) {
    if (this.frameSubscription) this.frameSubscription.remove()

    if (Platform.OS === 'desktop') {
      this.timer = setInterval(async () => {
        if (this.onNewFrame) {
          const frame = await SoundLevelModule.measure()
          this.onNewFrame(JSON.parse(frame))
        }
      }, 250)
    } else {
      this.frameSubscription = NativeAppEventEmitter.addListener(
        'frame',
        data => {
          if (this.onNewFrame) {
            this.onNewFrame(data)
          }
        }
      )
    }

    return SoundLevelModule.start(monitorInterval)
  },
  stop: function () {
    if (this.frameSubscription) this.frameSubscription.remove()
    if (this.timer) clearInterval(this.timer)
    return SoundLevelModule.stop()
  }
}

module.exports = SoundLevel
