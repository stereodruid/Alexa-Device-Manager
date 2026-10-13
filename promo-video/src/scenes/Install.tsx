import React from "react";
import {useVideoConfig} from "remotion";
import {Language, getCopy} from "../copy";
import {colors, Pill, Reveal, SceneShell, Screenshot, Title, fit} from "../SceneKit";

export const Install: React.FC<{duration: number; language: Language}> = ({duration, language}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const c = getCopy(language);
  return <SceneShell duration={duration} section={c.installSection}>
    <div style={{...fit(portrait), height: "100%", display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", justifyContent: "center", gap: portrait ? 62 : 80}}>
      <Reveal delay={4} style={{width: portrait ? "100%" : "45%"}}><Title small={portrait}>{c.installA}<br/><span style={{color: colors.cyan}}>{c.installB}</span></Title>
        <div style={{display: "flex", flexDirection: "column", gap: portrait ? 24 : 16, marginTop: portrait ? 44 : 32}}>{c.steps.map((step, i) => <Reveal key={step} delay={20 + i * 12}><Pill accent={i === 2 ? colors.green : colors.cyan}>{i + 1}. {step}</Pill></Reveal>)}</div>
      </Reveal>
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 24, width: portrait ? "100%" : "44%"}}>
        <Screenshot src="install.png" width={portrait ? width * .56 : width * .20} delay={8} rotate={-2}/>
        {!portrait && <Screenshot src="install-region.png" width={width * .20} delay={22} rotate={2}/>}
      </div>
    </div>
  </SceneShell>;
};
