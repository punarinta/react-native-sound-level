//
//  RNSoundLevelModule.h
//  RNSoundLevelModule
//
//  Created by Vladimir Osipov on 2018-07-09.
//  Copyright (c) 2018 Vladimir Osipov. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import <AVFoundation/AVFoundation.h>

@interface RNSoundLevelModule : NSObject <RCTBridgeModule, AVAudioRecorderDelegate>

@end