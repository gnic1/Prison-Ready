// VideoBackground — looping muted-fallback video used as a moody backdrop on
// the main menu. Defensively lazy-loads expo-video at runtime so the screen
// still renders if the module is missing or fails to initialize — in that
// case it falls back to a static ImageBackground.
//
// IMPORTANT: This component will play AUDIO. expo-video respects the device's
// silent-switch on iOS; on Android audio plays through the media channel.

import React from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

// Lazy-require expo-video. If the package isn't installed or the native
// module isn't linked yet, we set these to null and fall back to the static
// image, instead of crashing at module-load time.
let useVideoPlayer: any = null;
let VideoView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('expo-video');
  useVideoPlayer = mod.useVideoPlayer;
  VideoView = mod.VideoView;
} catch {
  // expo-video unavailable — fallback path will render
}

interface VideoBackgroundProps {
  source: number | { uri: string };
  fallback: ImageSourcePropType;
  muted?: boolean;
  /** 0..1 target volume. VideoBackground smoothly fades from the current
   *  level to this value, so callers can just flip values. */
  volume?: number;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  source,
  fallback,
  muted = false,
  volume,
}) => {
  // If expo-video isn't available, render the static image.
  if (!useVideoPlayer || !VideoView) {
    return (
      <ImageBackground source={fallback} style={StyleSheet.absoluteFill} resizeMode="cover">
        <View style={StyleSheet.absoluteFill} />
      </ImageBackground>
    );
  }

  return <VideoBackgroundInner source={source} fallback={fallback} muted={muted} volume={volume} />;
};

const VideoBackgroundInner: React.FC<VideoBackgroundProps> = ({
  source,
  fallback,
  muted,
  volume,
}) => {
  const [failed, setFailed] = React.useState(false);

  // Hooks are called unconditionally here, satisfying the rules of hooks.
  // Wrap in try/catch in case useVideoPlayer throws on this device.
  let player: any = null;
  try {
    player = useVideoPlayer(source, (p: any) => {
      try {
        p.loop = true;
        p.muted = Boolean(muted);
        p.play();
      } catch {
        // best effort
      }
    });
  } catch {
    if (!failed) setFailed(true);
  }

  // Smoothly animate the player volume toward the target. We tween in small
  // steps over ~500ms so a flip from 1 → 0.5 reads as a fade, not a cut.
  React.useEffect(() => {
    if (!player || failed) return;
    const target = Math.max(0, Math.min(1, typeof volume === 'number' ? volume : 1));
    let current = typeof player.volume === 'number' ? player.volume : 1;
    const stepMs = 40;
    const totalMs = 500;
    const steps = Math.max(1, Math.round(totalMs / stepMs));
    const delta = (target - current) / steps;
    const id = setInterval(() => {
      current = Math.abs(target - current) < Math.abs(delta) ? target : current + delta;
      try { player.volume = current; } catch {}
      if (current === target) clearInterval(id);
    }, stepMs);
    return () => clearInterval(id);
  }, [volume, player, failed]);

  if (failed || !player) {
    return (
      <ImageBackground source={fallback} style={StyleSheet.absoluteFill} resizeMode="cover">
        <View style={StyleSheet.absoluteFill} />
      </ImageBackground>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
};

export default VideoBackground;
