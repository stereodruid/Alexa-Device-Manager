import React from "react";
import {useVideoConfig} from "remotion";
import {Language, getCopy} from "../copy";
import {colors, Lead, Reveal, SceneShell, Screenshot, Title, fit} from "../SceneKit";

const ActionCard: React.FC<{icon: string; label: string; color: string; delay: number}> = ({icon, label, color, delay}) => (
  <Reveal delay={delay} style={{flex: 1}}><div style={{minWidth: 150, padding: "24px 18px", borderRadius: 22, border: `1px solid ${color}66`, background: `${color}13`, textAlign: "center", boxShadow: `0 0 30px ${color}12`}}><div style={{fontSize: 42, color}}>{icon}</div><div style={{fontSize: 22, fontWeight: 800, marginTop: 8}}>{label}</div></div></Reveal>
);

export const Actions: React.FC<{duration: number; language: Language}> = ({duration, language}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const c = getCopy(language);
  return <SceneShell duration={duration} section={c.actionsSection}>
    <div style={{...fit(portrait), height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: portrait ? 48 : 34}}>
      <Reveal delay={3}><Title small={portrait}>{c.actionsTitle}</Title></Reveal>
      <Reveal delay={14}><Lead>{c.actionsLead}</Lead></Reveal>
      <div style={{display: "flex", gap: portrait ? 18 : 24, flexWrap: portrait ? "wrap" : "nowrap"}}>
        <ActionCard icon="✓" label={c.enable} color={colors.green} delay={24}/><ActionCard icon="○" label={c.disable} color="#ffb34d" delay={32}/><ActionCard icon="⌁" label={c.dryRun} color={colors.cyan} delay={40}/><ActionCard icon="×" label={c.remove} color="#ff5964" delay={48}/>
      </div>
      <Reveal delay={58} style={{alignSelf: "center"}}><Screenshot src="quick-controls.png" width={portrait ? width * .86 : width * .48} delay={58}/></Reveal>
    </div>
  </SceneShell>;
};
