/** 调整 rough-notation 已生成的路径动画；负速率沿原路径反向播放。 */
export function setPathsPlayback(paths: SVGPathElement[], playbackRate: number): number {
  const animations = paths.flatMap((path) => Array.from(path.getAnimations()))
  for (const animation of animations) {
    animation.updatePlaybackRate(playbackRate)
    animation.play()
  }
  return animations.length
}
