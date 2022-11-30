import React from "react";
import { Chart } from "chart.js";
import StreamingPlugin from "chartjs-plugin-streaming";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";

Chart.register(StreamingPlugin);

export default function Stream(props) {
  return (
    <div>
      <Line
        data={{
          datasets: [
            {
              label: props.label,
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgb(54, 162, 235)",
              cubicInterpolationMode: "monotone",
              fill: true,
              data: [],
            },
          ],
        }}
        options={{
          scales: {
            x: {
              type: "realtime",
              realtime: {
                duration: 60000,
                delay: 2000,
                onRefresh: props.handleRefresh,
              },
            },
          },
        }}
      />
    </div>
  );
}
