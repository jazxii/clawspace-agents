import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { Background } from "./scenes/Background";
import { Title } from "./scenes/Title";
import { Dashboard } from "./scenes/Dashboard";
import { Agents } from "./scenes/Agents";
import { Channels } from "./scenes/Channels";
import { Kanban } from "./scenes/Kanban";
import { Pipeline } from "./scenes/Pipeline";
import { Graph } from "./scenes/Graph";
import { Cost } from "./scenes/Cost";
import { Proposals } from "./scenes/Proposals";
import { Merits } from "./scenes/Merits";
import { Outro } from "./scenes/Outro";

const T = 24;

// [Title, Dashboard, Agents, Channels, Kanban, Pipeline, Graph, Cost, Proposals, Merits, Outro]
const DURATIONS = [75, 175, 155, 175, 185, 110, 135, 125, 135, 90, 80];

export const TOTAL_FRAMES =
  DURATIONS.reduce((a, b) => a + b, 0) - T * (DURATIONS.length - 1);

const spr = springTiming({ config: { damping: 200 }, durationInFrames: T });
const lin = linearTiming({ durationInFrames: T });

export const ClawspaceShowcase: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const bgScale = interpolate(frame, [0, durationInFrames], [1.04, 1.14]);

  return (
    <AbsoluteFill style={{ background: "#0b0b0d" }}>
      <AbsoluteFill style={{ transform: `scale(${bgScale})` }}>
        <Background />
      </AbsoluteFill>

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={DURATIONS[0]}>
          <Title />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[1]}>
          <Dashboard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={spr} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[2]}>
          <Agents />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={spr} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[3]}>
          <Channels />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[4]}>
          <Kanban />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[5]}>
          <Pipeline />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={spr} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[6]}>
          <Graph />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[7]}>
          <Cost />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={spr} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[8]}>
          <Proposals />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[9]}>
          <Merits />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={DURATIONS[10]}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
