import React from "react";

export default class RaceChart extends React.Component {
  render() {
    let svgWidth = 200;
    let svgHeight = 145;
    if(this.props.expanded) {
      svgWidth = window.innerWidth - 40;
      svgHeight = Math.round(window.innerHeight - 160);
    }
    let datasource = this.props.datasource;
    let logmode = this.props.logmode;
    let dayOffset = this.props.dayOffset;
    let barWidth = svgWidth / (datasource.datasets.length);
    return (
      <svg width={svgWidth} height={svgHeight} role="img">
        {
          this.props.names.sort((a, b) => {
              let val_a = datasource.datasets[datasource.datasets.length - 1].data[a].absolute.current.confirmed;
              let val_b = datasource.datasets[datasource.datasets.length - 1].data[b].absolute.current.confirmed;
              if(val_a > val_b) {
                return -1;
              } else if(val_a < val_b) {
                return 1;
              }
              return 0;
            }).map((name, index) => {
            let max = datasource.maxValue;
            let points = "";
            Object.values(datasource.datasets).map((dataset, dateIndex) => {
              let value = dataset.data[name].absolute.current.confirmed;
              if(value > 0) {
                if (logmode) {
                  value = Math.round((Math.log(value) / Math.log(max)) * svgHeight);
                } else {
                  value = Math.round((value / max) * svgHeight);
                }
              }
              points += dateIndex * barWidth + "," + (svgHeight - value) + " ";
              return true;
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
