import React from "react";
import {Composition} from "remotion";
import {Promo} from "./Promo";

const common = {component: Promo, durationInFrames: 1260, fps: 30};

export const RemotionRoot = () => <>
  <Composition id="PromoLandscapeDE" {...common} width={1920} height={1080} defaultProps={{language: "de"}}/>
  <Composition id="PromoPortraitDE" {...common} width={1080} height={1920} defaultProps={{language: "de"}}/>
  <Composition id="PromoLandscapeEN" {...common} width={1920} height={1080} defaultProps={{language: "en"}}/>
  <Composition id="PromoPortraitEN" {...common} width={1080} height={1920} defaultProps={{language: "en"}}/>
</>;
