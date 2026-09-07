import { Composition } from "remotion";
import { Promo } from "./Promo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
