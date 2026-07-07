'use strict'

import { NativeModules, NativeEventEmitter, DeviceEventEmitter, Platform } from 'react-native'

var SoundLevelModule =
  Platform.OS === 'desktop'
    ? NativeModules.RNSoundLevel
    : NativeModules.RNSoundLevelModule

var SoundLevel = {
  timer: null,
  frameEmitter: null,

  start: function (_monitorConfig = 250) {
    const monitorConfig = {
      monitorInterval: 250,
      samplingRate: 22050,
      allowHapticsAndSystemSoundsDuringRecording: false,
    }

    if (typeof _monitorConfig === 'number') {
      monitorConfig.monitorInterval = _monitorConfig
    } else if (_monitorConfig && typeof _monitorConfig === 'object') {
      Object.keys(monitorConfig).forEach(key => {
        if (_monitorConfig[key] !== undefined) {
          monitorConfig[key] = _monitorConfig[key]
        }
      })
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
      if (!this.frameEmitter) {
        // On iOS events are sent by the native module itself, on Android
        // they arrive through the global RCTDeviceEventEmitter
        this.frameEmitter =
          Platform.OS === 'ios'
            ? new NativeEventEmitter(SoundLevelModule)
            : DeviceEventEmitter
      }

      this.frameSubscription = this.frameEmitter.addListener(
        'frame',
        data => {
          if (this.onNewFrame) {
            this.onNewFrame(data)
          }
        }
      )
    }

    switch (Platform.OS) {
      case 'desktop':
        return SoundLevelModule.start()
      case 'ios':
        return SoundLevelModule.start(
          monitorConfig.monitorInterval,
          monitorConfig.samplingRate,
          monitorConfig.allowHapticsAndSystemSoundsDuringRecording
        )
      default:
        return SoundLevelModule.start(monitorConfig.monitorInterval, monitorConfig.samplingRate)
    }
  },

  stop: function () {
    if (this.frameSubscription) {
      this.frameSubscription.remove()
      this.frameSubscription = null
    }

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    return SoundLevelModule.stop()
  }
}

module.exports = SoundLevel
