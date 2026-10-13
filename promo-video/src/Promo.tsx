import React from "react";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {Audio} from "@remotion/media";
import {Language} from "./copy";
import {Intro} from "./scenes/Intro";
import {Install} from "./scenes/Install";
import {Overview} from "./scenes/Overview";
import {Details} from "./scenes/Details";
import {Actions} from "./scenes/Actions";
import {AlexaAction} from "./scenes/AlexaAction";
import {Safety} from "./scenes/Safety";
import {Outro} from "./scenes/Outro";

export const Promo: React.FC<{language: Language}> = ({language}) => (
  <AbsoluteFill style={{backgroundColor: "#050a12"}}>
    <Audio src={staticFile("ambient.wav")} volume={0.28}/>
    <Sequence from={0} durationInFrames={120}><Intro duration={120} language={language}/></Sequence>
    <Sequence from={105} durationInFrames={210}><Install duration={210} language={language}/></Sequence>
    <Sequence from={300} durationInFrames={180}><Overview duration={180} language={language}/></Sequence>
    <Sequence from={465} durationInFrames={180}><Details duration={180} language={language}/></Sequence>
    <Sequence from={630} durationInFrames={195}><Actions duration={195} language={language}/></Sequence>
    <Sequence from={810} durationInFrames={195}><AlexaAction duration={195} language={language}/></Sequence>
    <Sequence from={990} durationInFrames={165}><Safety duration={165} language={language}/></Sequence>
    <Sequence from={1140} durationInFrames={120}><Outro duration={120} language={language}/></Sequence>
  </AbsoluteFill>
);
