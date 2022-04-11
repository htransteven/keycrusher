import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { ResponseTimeMapEntry } from "../../models/Telemetry";
import { toFixed } from "../../utils/numbers";

Chart.register(
  annotationPlugin,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip
);

export const ResponseVsKeyUsageTimeChart: React.FC<
  ResponseTimeMapEntry & { duration: number }
> = ({ char, averageResponseTime, history, duration }) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  const labels = useMemo(() => {
    return history.map((rt) => rt.time / 1000);
  }, [history]);

  const data = useMemo(() => {
    return history.map((rt) => rt.responseTime);
  }, [history]);

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
            label: `Response Time`,
            data,
            backgroundColor: theme.charts.data.primary.mainColor,
            borderColor: theme.charts.data.primary.translucentColor,
            borderWidth: 1,
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
            text: "Response Time vs Key Usage Time",
            color: theme.charts.text.primaryColor,
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                return `${toFixed(item.parsed.y, 3)} ms`;
              },
              title: (items) => {
                return items.map(
                  (item) => `Usage at ${toFixed(item.parsed.x, 3)} s`
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
                yMin: averageResponseTime,
                yMax: averageResponseTime,
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
            },
            beginAtZero: true,
            max: toFixed(duration / 1000, 3),
          },
          y: {
            type: "linear",
            beginAtZero: true,
            title: {
              display: true,
              text: "Response Time (ms)",
              color: theme.charts.text.primaryColor,
            },
            grid: {
              color: theme.charts.data.secondary.mainColor,
              tickColor: theme.charts.data.secondary.mainColor,
            },
            ticks: {
              color: theme.charts.text.primaryColor,
            },
          },
        },
      },
    });

    setChartInstance(newChartInstance);
  }, [averageResponseTime, char, chartInstance, duration, labels, data, theme]);

  useLayoutEffect(() => {
    if (!chartInstance) return;

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;

    if (chartInstance.options.plugins?.annotation) {
      chartInstance.options.plugins.annotation = {
        annotations: {
          averageLine: {
            type: "line",
            yMin: averageResponseTime,
            yMax: averageResponseTime,
            borderDash: [8, 12],
            borderColor: theme.charts.text.primaryColor,
            borderWidth: 1.5,
          },
        },
      };
    }

    chartInstance.update();
  }, [chartInstance, averageResponseTime, labels, data, theme]);

  return <canvas ref={chartRef} />;
};
