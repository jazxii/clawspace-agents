import React from "react";
import { Composition } from "remotion";
import { ClawspaceShowcase, TOTAL_FRAMES } from "./ClawspaceShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ClawspaceShowcase"
      component={ClawspaceShowcase}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
