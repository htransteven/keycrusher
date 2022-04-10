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

Chart.register(
  annotationPlugin,
  CategoryScale,
  BarController,
  BarElement,
  LinearScale,
  Title,
  Tooltip
);

export const ResponseVsKeyChart: React.FC<{
  telemetry: Telemetry;
  selectedKey?: string;
  onSelect?: (key: string) => void;
}> = ({ telemetry, selectedKey, onSelect }) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  const sortedKeys = useMemo(
    () =>
      Object.keys(telemetry.responseTimeMap).sort((a, b) => (a > b ? 1 : -1)),
    [telemetry.responseTimeMap]
  );

  useLayoutEffect(() => {
    if (!chartRef.current) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      return;
    }

    if (chartInstance) return;

    const newChartInstance = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: sortedKeys,
        datasets: [
          {
            label: "Response Time",
            data: sortedKeys.map(
              (key) => telemetry.responseTimeMap[key].averageResponseTime
            ),
            backgroundColor: sortedKeys.map((key) =>
              key === selectedKey
                ? theme.charts.data.primary.translucentColor
                : theme.charts.data.secondary.translucentColor
            ),
            borderColor: sortedKeys.map((key) =>
              key === selectedKey
                ? theme.charts.data.primary.highlightColor
                : theme.charts.data.secondary.highlightColor
            ),
            borderWidth: 1,
          },
        ],
      },
      options: {
        onClick: (_, elements, chart) => {
          if (elements.length === 0) return;

          if (typeof onSelect === "function") {
            onSelect(sortedKeys[elements[0].index]);
          }
        },
        plugins: {
          title: {
            display: true,
            text: "Response Time vs Key",
            color: theme.charts.text.primaryColor,
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                return `${item.formattedValue} ms`;
              },
            },
            xAlign: "center",
            yAlign: "bottom",
          },
          annotation: {
            annotations: {
              averageLine: {
                type: "line",
                yMin: telemetry.averageResponseTime,
                yMax: telemetry.averageResponseTime,
                borderDash: [8, 12],
                borderColor: theme.charts.text.primaryColor,
                borderWidth: 1.5,
                label: {
                  enabled: true,
                  content: `AVG RESPONSE TIME = ${telemetry.averageResponseTime.toFixed(
                    3
                  )} ms`,
                  textAlign: "end",
                },
              },
            },
          },
        },
        scales: {
          x: {
            type: "category",
            title: {
              display: true,
              text: "Key",
              color: theme.charts.text.primaryColor,
            },
            ticks: {
              color: theme.charts.text.primaryColor,
            },
            grid: {
              color: theme.charts.data.secondary.mainColor,
              tickColor: theme.charts.data.secondary.mainColor,
            },
          },
          y: {
            type: "linear",
            beginAtZero: true,
            title: {
              display: true,
              text: "Response Time",
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
  }, [chartInstance, onSelect, selectedKey, sortedKeys, telemetry, theme]);

  useLayoutEffect(() => {
    if (!chartInstance) return;

    chartInstance.data.datasets[0].backgroundColor = sortedKeys.map((key) =>
      key === selectedKey
        ? theme.charts.data.primary.translucentColor
        : theme.charts.data.secondary.translucentColor
    );
    chartInstance.data.datasets[0].borderColor = sortedKeys.map((key) =>
      key === selectedKey
        ? theme.charts.data.primary.highlightColor
        : theme.charts.data.secondary.highlightColor
    );
    chartInstance.update();
  }, [chartInstance, selectedKey, sortedKeys, theme]);

  return <canvas ref={chartRef} />;
};
