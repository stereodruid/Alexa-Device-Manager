import React from "react";
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Language, getCopy} from "../copy";
import {colors, Lead, Reveal, SceneShell, Title, fit} from "../SceneKit";

export const Intro: React.FC<{duration: number; language: Language}> = ({duration, language}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const c = getCopy(language);
  const glow = interpolate(frame, [0, 55, 110], [.35, 1, .45], {extrapolateRight: "clamp"});
  return <SceneShell duration={duration} section={c.introSection}>
    <div style={{...fit(portrait), height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: portrait ? "center" : "flex-start", gap: portrait ? 48 : 34}}>
      <Reveal delay={4}><div style={{width: width * (portrait ? .22 : .11), height: width * (portrait ? .22 : .11), borderRadius: 28, padding: 10, background: "#17273d", boxShadow: `0 0 ${55 * glow}px #20b7ff99`}}><Img src={staticFile("logo.png")} style={{width: "100%", height: "100%"}} /></div></Reveal>
      <Reveal delay={16} style={{maxWidth: portrait ? width * .86 : width * .72}}><Title align={portrait ? "center" : "left"}>{c.introTitleA}<br/><span style={{color: colors.cyan}}>{c.introTitleB}</span></Title></Reveal>
      <Reveal delay={30} style={{maxWidth: portrait ? width * .8 : width * .65}}><Lead align={portrait ? "center" : "left"}>{c.introLead}</Lead></Reveal>
      <Reveal delay={46}><div style={{fontSize: width * (portrait ? .031 : .016), fontWeight: 800, color: colors.green, letterSpacing: 2}}>CHROME EXTENSION · OPEN SOURCE</div></Reveal>
    </div>
  </SceneShell>;
};
