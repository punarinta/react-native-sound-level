'use strict'

import { NativeModules, NativeAppEventEmitter, Platform } from 'react-native'

var SoundLevelModule =
  Platform.OS === 'desktop'
    ? NativeModules.RNSoundLevel
    : NativeModules.RNSoundLevelModule

var SoundLevel = {
  timer: null,

  start: function (_monitorConfig = 250) {
    const monitorConfig = {
      monitorInterval: 250,
      samplingRate: 22050,
    }

    if (typeof _monitorConfig === 'number') {
      monitorConfig.monitorInterval = _monitorConfig
    }

    if (this.frameSubscription) {
      this.frameSubscription.remove()
    }

    if (Platform.OS === 'desktop') {
      this.timer = setInterval(async () => {
        if (this.onNewFrame) {
          const frame = await SoundLevelModule.measure()
          this.onNewFrame(JSON.parse(frame))
        }
      }, monitorConfig.monitorInterval)
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

    // Monitoring interval not supported for Android yet. Feel free to add and do a pull request. :)
    return Platform.OS !== 'desktop' ? SoundLevelModule.start(monitorConfig.monitorInterval, monitorConfig.samplingRate) : SoundLevelModule.start()
  },

  stop: function () {
    if (this.frameSubscription) {
      this.frameSubscription.remove()
    }

    if (this.timer) {
      clearInterval(this.timer)
    }

    return SoundLevelModule.stop()
  }
}

module.exports = SoundLevel
