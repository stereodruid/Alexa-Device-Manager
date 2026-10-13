import React from "react";
import {useVideoConfig} from "remotion";
import {Language, getCopy} from "../copy";
import {colors, Lead, Pill, Reveal, SceneShell, Screenshot, Title, fit} from "../SceneKit";

export const Details: React.FC<{duration: number; language: Language}> = ({duration, language}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const c = getCopy(language);
  return <SceneShell duration={duration} section={c.detailsSection}>
    <div style={{...fit(portrait), height: "100%", display: "flex", flexDirection: portrait ? "column" : "row-reverse", alignItems: "center", justifyContent: "center", gap: portrait ? 50 : 100}}>
      <Reveal delay={3} style={{width: portrait ? "100%" : "43%"}}>
        <Title small={portrait}>{c.detailsA}<br/><span style={{color: colors.green}}>{c.detailsB}</span></Title>
        <div style={{marginTop: 28}}><Lead>{c.detailsLead}</Lead></div>
        <div style={{display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34}}><Pill accent={colors.green}>{c.live}</Pill><Pill>{c.details}</Pill></div>
      </Reveal>
      <Screenshot src="info-panel.png" width={portrait ? width * .72 : width * .27} maxHeight={portrait ? height * .55 : height * .75} delay={8}/>
    </div>
  </SceneShell>;
};
