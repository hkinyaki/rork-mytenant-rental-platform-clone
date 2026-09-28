import React from "react";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import Colors from "@/constants/colors";

interface SimpleBarChartProps {
  values: number[];
  labels: string[];
  color: string;
  formatValue: (value: number) => string;
}

/**
 * Minimal vertical bar chart built from raw react-native-svg primitives.
 * Fixed viewBox (0 0 100 50) keeps bar geometry proportional — it scales
 * with the card width without pixel math.
 */
export default function SimpleBarChart({ values, labels, color, formatValue }: SimpleBarChartProps) {
  const max = Math.max(...values, 1);
  const slot = 100 / values.length;
  const barWidth = slot * 0.55;
  const baselineY = 42;
  const chartHeight = 34;

  return (
    <Svg viewBox="0 0 100 50" width="100%" height={140}>
      <Rect x={4} y={baselineY} width={92} height={0.6} rx={0.3} fill={Colors.borderLight} />
      {values.map((value, index) => {
        const barHeight = Math.max(1.5, (value / max) * chartHeight);
        const x = index * slot + (slot - barWidth) / 2;
        return (
          <React.Fragment key={index}>
            <Rect
              x={x}
              y={baselineY - barHeight}
              width={barWidth}
              height={barHeight}
              rx={1.5}
              fill={color}
            />
            <SvgText
              x={x + barWidth / 2}
              y={baselineY - barHeight - 2}
              fontSize={4}
              fontWeight="600"
              fill={Colors.text}
              textAnchor="middle"
            >
              {formatValue(value)}
            </SvgText>
            <SvgText
              x={x + barWidth / 2}
              y={49}
              fontSize={4.5}
              fill={Colors.textSecondary}
              textAnchor="middle"
            >
              {labels[index]}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
