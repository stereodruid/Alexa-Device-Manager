import React from "react";
import {useVideoConfig} from "remotion";
import {Language, getCopy} from "../copy";
import {colors, Pill, Reveal, SceneShell, Screenshot, Title, fit} from "../SceneKit";

export const AlexaAction: React.FC<{duration: number; language: Language}> = ({duration, language}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const c = getCopy(language);
  return <SceneShell duration={duration} section={c.alexaSection}>
    <div style={{...fit(portrait), height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: portrait ? 54 : 38}}>
      <Reveal delay={3}><Title small={portrait} align="center">{c.alexaA} <span style={{color: colors.cyan}}>{c.alexaB}</span></Title></Reveal>
      <Screenshot src="smart-actions.png" width={portrait ? width * .88 : width * .42} delay={12}/>
      <Reveal delay={28} style={{display: "flex", gap: portrait ? 18 : 24, flexWrap: "wrap", justifyContent: "center"}}><Pill accent={colors.green}>{c.speak}</Pill><Pill>{c.announce}</Pill><Pill accent="#a98cff">{c.command}</Pill></Reveal>
    </div>
  </SceneShell>;
};
