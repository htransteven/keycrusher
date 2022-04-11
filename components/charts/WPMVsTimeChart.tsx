import {
  Chart,
  CategoryScale,
  BarController,
  BarElement,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { Telemetry } from "../../models/Telemetry";
import { toFixed } from "../../utils/numbers";

Chart.register(
  annotationPlugin,
  CategoryScale,
  BarController,
  BarElement,
  LinearScale,
  Title,
  Tooltip
);

export const WPMVsTimeChart: React.FC<
  {
    telemetry: Telemetry;
  } & { duration: number }
> = ({ telemetry, duration }) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  const labels = useMemo(() => {
    return telemetry.wpm.map((wpm) => wpm.time / 1000);
  }, [telemetry.wpm]);

  const data = useMemo(() => {
    return telemetry.wpm.map((wpm) => wpm.wpm);
  }, [telemetry.wpm]);

  useLayoutEffect(() => {
    if (!chartRef.current) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      return;
    }

    if (chartInstance) return;

    const newChartInstance = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `WPM`,
            data,
            backgroundColor: theme.charts.data.primary.mainColor,
            borderColor: theme.charts.data.primary.translucentColor,
            borderWidth: 1,
            tension: 0.3,
          },
        ],
      },
      options: {
        interaction: {
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: "WPM vs Time",
            color: theme.charts.text.primaryColor,
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                return `${toFixed(item.parsed.y, 3)} wpm`;
              },
              title: (items) => {
                return items.map(
                  (item) => `Time = ${toFixed(item.parsed.x, 3)} s`
                );
              },
            },
            xAlign: "center",
            yAlign: "bottom",
          },
          annotation: {
            annotations: {
              averageLine: {
                type: "line",
                yMin: telemetry.averageWPM,
                yMax: telemetry.averageWPM,
                borderDash: [8, 12],
                borderColor: theme.charts.text.primaryColor,
                borderWidth: 1.5,
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            title: {
              display: true,
              text: "Time (s)",
              color: theme.charts.text.primaryColor,
            },
            grid: {
              color: theme.charts.data.secondary.mainColor,
              tickColor: theme.charts.data.secondary.mainColor,
            },
            ticks: {
              color: theme.charts.text.primaryColor,
              callback: (value) => {
                return `${value} s`;
              },
            },
            beginAtZero: true,
            max: toFixed(duration / 1000, 3),
          },
          y: {
            type: "linear",
            beginAtZero: true,
            title: {
              display: true,
              text: "WPM",
              color: theme.charts.text.primaryColor,
            },
            grid: {
              color: theme.charts.data.secondary.mainColor,
              tickColor: theme.charts.data.secondary.mainColor,
            },
            ticks: {
              color: theme.charts.text.primaryColor,
              callback: (value) => {
                return `${value} ms`;
              },
            },
          },
        },
      },
    });

    setChartInstance(newChartInstance);
  }, [chartInstance, data, duration, labels, telemetry.averageWPM, theme]);

  return <canvas ref={chartRef} />;
};
