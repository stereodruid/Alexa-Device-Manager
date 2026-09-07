import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";

export const Promo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation for the title
  const titleY = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12 },
  });
  
  // Opacity for the title fading out
  const titleOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateRight: "clamp",
  });

  // Scale animation for the screenshot
  const screenshotScale = spring({
    frame: frame - 130,
    fps,
    config: { damping: 14 },
  });

  // Pan animation for the screenshot to show the UI clearly
  const screenshotY = interpolate(frame, [200, 300], [0, -400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Outro Text opacity
  const outroOpacity = interpolate(frame, [350, 370], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1120", fontFamily: "sans-serif", color: "white" }}>
      {/* Scene 1: The Problem / Intro */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: titleOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 100,
            transform: `translateY(${(1 - titleY) * 100}px)`,
            opacity: titleY,
            textAlign: "center",
          }}
        >
          Tired of deleting Alexa ghost devices <br />
          <span style={{ color: "#facc15" }}>one by one?</span>
        </h1>
      </AbsoluteFill>

      {/* Scene 2: The Solution (Screenshot) */}
      {frame > 120 && frame < 360 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              transform: `scale(${screenshotScale}) translateY(${screenshotY}px)`,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <Img src={staticFile("preview.png")} style={{ width: "1400px" }} />
          </div>
          <h2
            style={{
              position: "absolute",
              bottom: "100px",
              fontSize: 70,
              backgroundColor: "rgba(11, 17, 32, 0.8)",
              padding: "20px 40px",
              borderRadius: "20px",
              opacity: interpolate(frame, [160, 180, 320, 340], [0, 1, 1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
            }}
          >
            Meet <span style={{ color: "#38bdf8" }}>Alexa Device Manager</span>
          </h2>
        </AbsoluteFill>
      )}

      {/* Scene 3: Outro */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: outroOpacity,
        }}
      >
        <h1 style={{ fontSize: 120, marginBottom: "20px" }}>Free & Open Source</h1>
        <h2 style={{ fontSize: 60, color: "#9ca3af", fontWeight: "normal" }}>
          Available on GitHub as a Chrome Extension
        </h2>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
