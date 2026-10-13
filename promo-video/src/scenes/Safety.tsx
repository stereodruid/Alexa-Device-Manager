import React from "react";
import {useVideoConfig} from "remotion";
import {Language, getCopy} from "../copy";
import {colors, Lead, Reveal, SceneShell, Screenshot, Title, fit} from "../SceneKit";

export const Safety: React.FC<{duration: number; language: Language}> = ({duration, language}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const c = getCopy(language);
  return <SceneShell duration={duration} section={c.safetySection}>
    <div style={{...fit(portrait), height: "100%", display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", justifyContent: "center", gap: portrait ? 54 : 90}}>
      <div style={{width: portrait ? "100%" : "48%"}}>
        <Reveal delay={3}><Title small={portrait}>{c.safetyA}<br/><span style={{color: colors.green}}>{c.safetyB}</span></Title></Reveal>
        <Reveal delay={15} style={{marginTop: 24}}><Lead>{c.safetyLead}</Lead></Reveal>
        <div style={{display: "grid", gridTemplateColumns: portrait ? "1fr" : "1fr 1fr", gap: 14, marginTop: 34}}>
          {c.safetyCards.map((card, i) => <Reveal key={card} delay={26 + i * 9}><div style={{padding: "18px 20px", border: "1px solid #2a4668", borderRadius: 16, background: "#111d30d9", fontSize: width * (portrait ? .026 : .014), fontWeight: 750}}>✓ <span style={{marginLeft: 10}}>{card}</span></div></Reveal>)}
        </div>
      </div>
      <Screenshot src="language-backup.png" width={portrait ? width * .86 : width * .34} delay={18}/>
    </div>
  </SceneShell>;
};
