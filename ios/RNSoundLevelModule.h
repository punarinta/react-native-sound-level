//
//  RNSoundLevelModule.h
//  RNSoundLevelModule
//
//  Created by Vladimir Osipov on 2018-07-09.
//  Copyright (c) 2018 Vladimir Osipov. All rights reserved.
//

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else
#import "RCTBridgeModule.h"
#endif

#import <AVFoundation/AVFoundation.h>

#if __has_include(<React/RCTLog.h>)
#import <React/RCTLog.h>
#else
#import "RCTLog.h"
#endif

#import <AVFoundation/AVFoundation.h>

@interface RNSoundLevelModule : NSObject <RCTBridgeModule, AVAudioRecorderDelegate>

@end
