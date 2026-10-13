import React from "react";
import {Img, staticFile, useVideoConfig} from "remotion";
import {Language, getCopy} from "../copy";
import {colors, Reveal, SceneShell, Title, fit} from "../SceneKit";

export const Outro: React.FC<{duration: number; language: Language}> = ({duration, language}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const c = getCopy(language);
  const lineSize = width * (portrait ? .031 : .018);
  return <SceneShell duration={duration} section={c.outroSection}>
    <div style={{...fit(portrait), height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: portrait ? 30 : 18, textAlign: "center"}}>
      <Reveal delay={4}><Img src={staticFile("logo.png")} style={{width: width * (portrait ? .17 : .08), height: width * (portrait ? .17 : .08), filter: "drop-shadow(0 0 28px #20b7ffaa)"}}/></Reveal>
      <Reveal delay={12}><Title small={portrait} align="center">Aura Device Master</Title></Reveal>
      <Reveal delay={22}><div style={{fontSize: lineSize, fontWeight: 850, color: colors.green}}>{c.free}</div></Reveal>
      <Reveal delay={30}><div style={{fontSize: lineSize, color: "#c5d7e9"}}>{c.local}<br/>{c.session}</div></Reveal>
      <Reveal delay={40}><div style={{fontSize: lineSize, color: colors.cyan, fontWeight: 800}}>{c.store}</div></Reveal>
      <Reveal delay={50}><div style={{marginTop: 8, padding: "16px 28px", borderRadius: 18, background: `linear-gradient(135deg,${colors.blue},#0aa9e8)`, fontSize: width * (portrait ? .027 : .017), fontWeight: 900, boxShadow: "0 18px 50px #0878df55"}}>github.com/stereodruid/Alexa-Device-Manager</div></Reveal>
    </div>
  </SceneShell>;
};
