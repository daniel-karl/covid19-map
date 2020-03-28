import React from "react";

export default class RaceChart extends React.Component {
  render() {
    let svgWidth = 200;
    let svgHeight = 145;
    let datasource = this.props.datasource;
    let logmode = this.props.logmode;
    let dayOffset = this.props.dayOffset;
    let barWidth = svgWidth / (datasource.datasets.length);
    return (
      <svg width={svgWidth} heigth={svgHeight} role="img">
        {
          this.props.names.map((name, index) => {
            let max = datasource.maxValue;
            let points = "";
            let lastValue;
            Object.values(datasource.datasets).map((dataset, dateIndex) => {
              let value = dataset.data[name].absolute.current.confirmed;
              if(value > 0) {
                if (logmode) {
                  value = Math.round((Math.log(value) / Math.log(max)) * svgHeight);
                } else {
                  value = Math.round((value / max) * svgHeight);
                }
                lastValue = value;
              }
              points += dateIndex * barWidth + "," + (svgHeight - value) + " ";
            });
            return (
              <g>
                <polyline className={"line line"+index}
                  points={points}
                ></polyline>
                <text
                  className={"legend legend"+index}
                  x={0}
                  y={10 * (index + 1)}
                >
                  {name}
                </text>
              </g>
            );
          })
        }
        <g className="todayMarkerLineChart">
          <rect
              x={(datasource.datasets.length - 1 + dayOffset) * barWidth}
              y={0}
              width={barWidth}
              height={svgHeight}></rect>
        </g>
      </svg>
    );
  }
}
