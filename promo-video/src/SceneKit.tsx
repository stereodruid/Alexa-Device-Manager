import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

export const colors = {bg: "#07101d", cyan: "#20b7ff", blue: "#0878df", green: "#00e394", text: "#f7fbff", muted: "#9db3cc"};

export const SceneShell: React.FC<{children: React.ReactNode; duration: number; section: string}> = ({children, duration, section}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const opacity = interpolate(frame, [0, 14, duration - 14, duration], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return <AbsoluteFill style={{opacity, overflow: "hidden", background: `radial-gradient(circle at 78% 18%, #123a5b 0, ${colors.bg} 42%, #050a12 100%)`, color: colors.text, fontFamily: "Inter, Segoe UI, Arial, sans-serif"}}>
    <div style={{position: "absolute", width: width * .55, height: width * .55, right: -width * .16, top: -width * .28, borderRadius: "50%", border: `${Math.max(2, width / 700)}px solid #20b7ff24`, boxShadow: "0 0 90px #20b7ff20"}} />
    <div style={{position: "absolute", inset: 0, opacity: .22, backgroundImage: "linear-gradient(#5ac8ff0b 1px, transparent 1px),linear-gradient(90deg,#5ac8ff0b 1px,transparent 1px)", backgroundSize: `${width / 24}px ${width / 24}px`}} />
    <div style={{position: "absolute", left: width * .045, top: height * .045, fontSize: width * .012, letterSpacing: width * .003, fontWeight: 800, color: colors.cyan, textTransform: "uppercase"}}>{section}</div>
    {children}
    <div style={{position: "absolute", left: width * .045, right: width * .045, bottom: height * .035, height: 3, background: "#ffffff12", borderRadius: 9}}><div style={{width: `${interpolate(frame, [0, duration], [0, 100], {extrapolateRight: "clamp"})}%`, height: "100%", background: `linear-gradient(90deg,${colors.blue},${colors.cyan},${colors.green})`, boxShadow: `0 0 14px ${colors.cyan}`}} /></div>
  </AbsoluteFill>;
};

export const Title: React.FC<{children: React.ReactNode; small?: boolean; align?: "left" | "center"}> = ({children, small = false, align = "left"}) => {const {width}=useVideoConfig(); return <div style={{fontSize: width * (small ? .038 : .052), lineHeight: 1.02, fontWeight: 900, letterSpacing: -width * .0024, textAlign: align}}>{children}</div>;};
export const Lead: React.FC<{children: React.ReactNode; align?: "left" | "center"}> = ({children, align = "left"}) => {const {width}=useVideoConfig(); return <div style={{fontSize: width * .021, lineHeight: 1.35, color: colors.muted, fontWeight: 520, textAlign: align}}>{children}</div>;};
export const Reveal: React.FC<{children: React.ReactNode; delay?: number; x?: number; y?: number; style?: React.CSSProperties}> = ({children, delay = 0, x = 0, y = 35, style}) => {const frame=useCurrentFrame(); const p=interpolate(frame,[delay,delay+24],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.16,1,.3,1)}); return <div style={{opacity:p,translate:`${(1-p)*x}px ${(1-p)*y}px`,...style}}>{children}</div>;};
export const Screenshot: React.FC<{src: string; width: number | string; maxHeight?: number | string; delay?: number; rotate?: number}> = ({src,width,maxHeight,delay=8,rotate=0}) => {const frame=useCurrentFrame(); const p=interpolate(frame,[delay,delay+28],[.88,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.16,1,.3,1)}); return <div style={{width,maxHeight,padding:10,borderRadius:30,background:"linear-gradient(135deg,#2b4568,#0a111d)",boxShadow:"0 35px 90px #000b,0 0 55px #20b7ff22",scale:p,rotate:`${rotate*(1-p)}deg`,overflow:"hidden"}}><Img src={staticFile(src)} style={{display:"block",width:"100%",height:"100%",objectFit:"contain",borderRadius:20}}/></div>;};
export const Pill: React.FC<{children: React.ReactNode; accent?: string}> = ({children,accent=colors.cyan}) => {const {width}=useVideoConfig(); return <div style={{display:"inline-flex",alignItems:"center",gap:12,border:`1px solid ${accent}66`,background:`${accent}17`,borderRadius:999,padding:`${width*.008}px ${width*.015}px`,fontSize:width*.016,fontWeight:750,boxShadow:`0 0 24px ${accent}16`}}><span style={{width:width*.007,height:width*.007,borderRadius:"50%",background:accent,boxShadow:`0 0 16px ${accent}`}}/>{children}</div>;};
export const fit = (portrait: boolean): React.CSSProperties => portrait ? {padding: "150px 74px 120px"} : {padding: "110px 90px 80px"};
