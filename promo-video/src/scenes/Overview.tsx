import React from "react";
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Language, getCopy} from "../copy";
import {colors, Pill, Reveal, SceneShell, Title, fit} from "../SceneKit";

export const Overview: React.FC<{duration: number; language: Language}> = ({duration, language}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const c = getCopy(language);
  const zoom = interpolate(frame, [0, duration], [portrait ? 1.55 : 1.04, portrait ? 1.82 : 1.13], {extrapolateRight: "clamp"});
  const x = interpolate(frame, [0, duration], portrait ? [-330, -650] : [0, -35], {extrapolateRight: "clamp"});
  return <SceneShell duration={duration} section={c.overviewSection}>
    <div style={{...fit(portrait), height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: portrait ? 42 : 30}}>
      <Reveal delay={3}><Title small={portrait}><span style={{color: colors.cyan}}>{c.overviewA}</span> {c.overviewB}</Title></Reveal>
      <div style={{height: portrait ? height * .57 : height * .65, borderRadius: 30, overflow: "hidden", border: "1px solid #4ebfff55", boxShadow: "0 35px 100px #000c,0 0 50px #20b7ff20", position: "relative", background: "#101b2c"}}>
        <Img src={staticFile("full-view.png")} style={{position: "absolute", width: portrait ? 2250 : width * .94, maxWidth: "none", left: "50%", top: "50%", translate: `calc(-50% + ${x}px) -50%`, scale: zoom}} />
        <div style={{position: "absolute", inset: 0, boxShadow: "inset 0 0 80px #02060dcc"}} />
      </div>
      <Reveal delay={35} style={{display: "flex", gap: 14, flexWrap: "wrap"}}>
        <Pill>{c.search}</Pill><Pill>{c.filter}</Pill><Pill accent={colors.green}>{c.sort}</Pill>
      </Reveal>
    </div>
  </SceneShell>;
};
