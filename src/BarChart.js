import React from "react";

export default class BarChart extends React.Component {
  render() {
    let datasource = this.props.datasource;
    let name = this.props.name;
    let logmode = this.props.logmode;
    let dayOffset = this.props.dayOffset;
    return (
      <svg width="272" heigth="145" role="img">
        {
          datasource.datasets[datasource.datasets.length - 5].data[name].absolute.current.confirmed === -1 &&
          [
            <text
              className={"barChartNoData"}
              x={70}
              y={70}
            >
              No historic data provided.
            </text>,
            <text
              className={"legend"}
              x={65}
              y={85}
            >
              Showing single bar of today only &nbsp; &nbsp; &nbsp;⟶
            </text>
          ]
        }
        {
          Object.values(datasource.datasets).map((dataset, dateIndex) => {
            let svgWidth = 272;
            let svgHeight = 145;
            let barWidth = svgWidth / (datasource.datasets.length);
            let max = datasource.maxValue;
            // let confirmedProjectedBarHeight;
            let confirmedBarHeight;
            let recoveredBarHeight;
            let deceasedBarHeight;
            if(logmode) {
                // confirmedProjectedBarHeight = Math.round((Math.log(dataset.data[name].absolute.current.confirmedProjected * this.state.testscale) / Math.log(max)) * svgHeight);
                confirmedBarHeight = Math.round((Math.log(dataset.data[name].absolute.current.confirmed) / Math.log(max)) * svgHeight);
                recoveredBarHeight = Math.round((Math.log(dataset.data[name].absolute.current.recovered) / Math.log(max)) * svgHeight);
                deceasedBarHeight = Math.round((Math.log(dataset.data[name].absolute.current.deceased) / Math.log(max)) * svgHeight);
            } else {
                // confirmedProjectedBarHeight = Math.round((dataset.data[name].absolute.current.confirmedProjected * this.state.testscale / max) * svgHeight);
                confirmedBarHeight = Math.round((dataset.data[name].absolute.current.confirmed / max) * svgHeight);
                recoveredBarHeight = Math.round((dataset.data[name].absolute.current.recovered / max) * svgHeight);
                deceasedBarHeight = Math.round((dataset.data[name].absolute.current.deceased / max) * svgHeight);
            }
            if(isNaN(confirmedBarHeight) || !isFinite(confirmedBarHeight)) {
              confirmedBarHeight = 0;
            }
            if(isNaN(recoveredBarHeight) || !isFinite(recoveredBarHeight)) {
              recoveredBarHeight = 0;
            }
            if(isNaN(deceasedBarHeight) || !isFinite(deceasedBarHeight)) {
              deceasedBarHeight = 0;
            }
            return(
              <g>
                {
                  dayOffset === dateIndex - datasource.datasets.length + 1 &&
                  <g className="todayMarker">
                    <rect x={String(dateIndex * barWidth)} y={0} width={barWidth} height={svgHeight}></rect>
                  </g>
                }
                {
                  /*<g className="confirmedProjectedBar">
                    <rect x={String(dateIndex * barWidth)} y={svgHeight - confirmedProjectedBarHeight} width={barWidth} height={confirmedProjectedBarHeight}></rect>
                  </g>*/
                }
                <g className="confirmedBar">
                 <rect x={String(dateIndex * barWidth)} y={svgHeight - confirmedBarHeight} width={barWidth} height={confirmedBarHeight}></rect>
                </g>
                <g className="recoveredBar">
                  <rect x={String(dateIndex * barWidth)} y={svgHeight - recoveredBarHeight} width={barWidth} height={recoveredBarHeight}></rect>
                </g>
                <g className="deceasedBar">
                  <rect x={String(dateIndex * barWidth)} y={svgHeight - deceasedBarHeight} width={barWidth} height={deceasedBarHeight}></rect>
                </g>
              </g>
            );
          })
        }
      </svg>
    );
  }
}
