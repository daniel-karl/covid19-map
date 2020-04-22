import React, {memo} from "react";
import { Map, TileLayer, Tooltip as LTooltip,
    Polygon, CircleMarker, Rectangle, LayerGroup } from "react-leaflet";

import Tooltip from '@material-ui/core/Tooltip';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWindowMinimize,
  faUsers,
  faProcedures,
  faHeartbeat,
  faHeartBroken,
  faBiohazard,
  faStopCircle,
  faPauseCircle,
  faQuestion,
  faQuestionCircle, 
  faBug, 
  faBalanceScale, 
  faVial,
  faStepBackward,
  faStepForward,
  faShieldAlt,
  faExclamationTriangle,
  faShieldVirus,
  faWindowMaximize,
  faWindowRestore
} from '@fortawesome/free-solid-svg-icons';

import {faPlayCircle} from '@fortawesome/free-regular-svg-icons';

import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import BarChart from "./BarChart";
import {JHDatasourceProvider} from "./datasource/JHDatasourceProvider";
import * as Population from "./Population";
import * as Testing from "./TestingRates";
import Utils from "./Utils";

import { withStyles } from '@material-ui/core/styles';
import RaceChart from "./RaceChart";

const LightTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
  },
}))(Tooltip);

const ONE_M=1000000;

class MapChart extends Map {

  constructor(props) {
    super(props);

    this.state = {
      setTotalConfirmed: props.setTotalConfirmed,
      setTotalRecovered: props.setTotalRecovered,
      setTotalDeceased: props.setTotalDeceased,
      setTotalConfirmedProjected: props.setTotalConfirmedProjected,
      factor: 50,
      logmode: true,
      momentum: "none",
      ppmmode: false,
      minimized_controls: window.innerWidth < 500,
      minimized_timeline: window.innerWidth < 500,
      testmode: true,
      testscale: 0,
      dayOffset: 0,
      playmode: false,
      mapstyle: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      selectedData: ["projected", "confirmed", "recovered", "deceased"],
      datasource: null,
      leadership: "active",
      selectedLocations: ["Hubei, China", "Italy", "US", "Spain", "Germany", "France", "Iran", "United Kingdom", "Switzerland", "Austria"],
      showUScounties: false,
      showModal: true,

      expandRaceChart: false,

      lat: 50,
      lng: 10,
      zoom: 4,

      glyphs: "mountains"
    };

    this.map = null;

    let that = this;
    new JHDatasourceProvider().getDatasource(false,  (datasource) => {
      that.state.datasource = datasource;
      that.setState({});
    });
  }

  componentDidMount = () => {
      this.render();
  };

  componentDidUpdate = (prevProps) => {
    if(this.state.datasource) {
      this.updateLeafletElement(prevProps, this.props);
      const layers = this.map.leafletElement._layers;

      // bring to front one by one
      Object.values(layers).map((layer) => {
        if (layer.options.className === "projected") {
          layer.bringToFront();
        }
      });

      Object.values(layers).map((layer) => {
        if (layer.options.className === "confirmed") {
          layer.bringToFront();
        }
      });

      Object.values(layers).map((layer) => {
        if (layer.options.className === "recovered") {
          layer.bringToFront();
        }
      });

      Object.values(layers).map((layer) => {
        if (layer.options.className === "deceased") {
          layer.bringToFront();
        }
      });
    }
  };

  render() {
    if(!this.state.datasource) {
      return (<LinearProgress />);
    }
    else {
      let that = this;
      let ds = this.state.datasource.datasets[Math.max(0, this.state.datasource.datasets.length - 1 + this.state.dayOffset)];
      that.state.setTotalConfirmed(ds.totalConfirmed);
      that.state.setTotalRecovered(ds.totalRecovered);
      that.state.setTotalDeceased(ds.totalDeceased);
      that.state.setTotalConfirmedProjected(ds.totalConfirmedProjected * that.state.testscale);
      return (
          <>
            <Modal show={this.state.showModal} onHide={()=>{this.setState({showModal: false})}}>
                <Modal.Header className={"bg-light"} closeButton>
                  <Modal.Title><FontAwesomeIcon icon={faShieldVirus}/> Good to see you!</Modal.Title>
                </Modal.Header>
                <Modal.Body className={"text-justify"}>
                    <p><i>covid19map.io</i> is a free <a target="_blank" href="https://github.com/daniel-karl/covid19-map/#open-covid19-map-%EF%B8%8F">open source</a> project.</p>
                    <p>We provide a more detailed view on <a target="_blank" href="https://github.com/CSSEGISandData/COVID-19">Johns Hopkins University CSSE COVID-19 data repository</a>.</p>

                    <h3>Tutorial</h3>
                    <p>
                        <h5>Glyphs</h5>
                        We show cases of COVID-19 as glyphs on the map:<br />
                        <table cellPadding={3} className={"w-100"}>
                            <tr>
                                <td align={"center"}><img src={"glyphs.png"} height={"50px"}/></td>
                                <td align={"center"}><img src={"glyphs2.png"} height={"50px"}/></td>
                                <td align={"center"}><img src={"glyphs3.png"} height={"50px"}/></td>
                            </tr>
                            <tr>
                                <td align={"center"} className={"small text-secondary"}>Mountains</td>
                                <td align={"center"} className={"small text-secondary"}>Bubbles</td>
                                <td align={"center"} className={"small text-secondary"}>Candles</td>
                            </tr>
                        </table>
                        <span className="small text-danger">Red: Confirmed cases</span><br />
                        <span className="small text-success">Green: Recovered cases</span><br/>
                        <span className="small text-dark">Black: Deceased cases</span><br/>
                    </p>
                    <p>
                        <h5>Modes</h5>
                        <b>Cumulative mode:</b> Glyphs show cumulative confirmed, recovered and deceased numbers including live updates during the day.<br/>
                        <br/>
                        <b>Momentum mode:</b> Glyphs show growth (red) and shrinking (green) of active cases since last 1, 3 or 7 day(s).
                    </p>
                    <p>
                        <h5>Normalization</h5>
                        <b>Log:</b> Toggle between logarithmic and linear normalization of the data. Linear normalization preserves the absolute
                        differences in the data, whereas logarithmic scaling allows for comparison on the order of magnitude, i.e. the <i>length</i> of values.<br />
                        <br />
                        <b>Population:</b> Toggle whether to scale the data according to the number of people in a location.<br />
                        This also changes all numbers in the application to parts per million (<b>PPM</b>).
                    </p>
                    <p>
                        <h5>"What if?"-testing rates</h5>
                        Display how many confirmed cases there might be if the local testing rate in a location was coinciding with the global average.
                        We represent this number of <i>projected</i> confirmed cases as blue halos behind the known confirmed number (red).
                        <table cellPadding={3} className={"w-100"}>
                            <tr>
                                <td align={"center"}><img src={"glyphs5.png"} height={"50px"}/></td>
                                <td align={"center"}><img src={"glyphs4.png"} height={"50px"}/></td>
                                <td align={"center"}><img src={"glyphs6.png"} height={"50px"}/></td>
                            </tr>
                            <tr>
                                <td align={"center"} className={"small text-secondary"}>Mountains</td>
                                <td align={"center"} className={"small text-secondary"}>Bubbles</td>
                                <td align={"center"} className={"small text-secondary"}>Candles</td>
                            </tr>
                            <tr>
                                <td align={"center"} colSpan={3} className={"small"}>
                                    Projected confirmed numbers shown as blue halos.
                                </td>
                            </tr>
                        </table>
                    </p>
                    <p>
                        <h5>Replay mode</h5>
                        <table cellPadding={3}>
                            <tr>
                                <td valign={"top"}>
                                    Navigate back and forth in time to explore the history of COVID-19. You can also
                                    hit the green <span className="text-success">Play</span> button to start the interactive animation.
                                </td>
                                <td>
                                    <img src={"theatre.png"} />
                                </td>
                            </tr>
                        </table>
                    </p>
                    <p>
                        <h5>Containment Scores</h5>
                        <table>
                            <tr>
                                <td colSpan={12}>
                                    Based on weighted average growth of confirmed cases over the past 1, 3 and 7 days we compute
                                    Containment Scores that reflect the spread of COVID19 in different locations.<br />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={12}>&nbsp;</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore0"} style={{float: "left", fontSize: "10px"}}>
                                      0/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore1"} style={{float: "left", fontSize: "10px"}}>
                                      1/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore2"} style={{float: "left", fontSize: "10px"}}>
                                      2/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore3"} style={{float: "left", fontSize: "10px"}}>
                                      3/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore4"} style={{float: "left", fontSize: "10px"}}>
                                      4/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore5"} style={{float: "left", fontSize: "10px"}}>
                                      5/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore6"} style={{float: "left", fontSize: "10px"}}>
                                      6/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore7"} style={{float: "left", fontSize: "10px"}}>
                                      7/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore8"} style={{float: "left", fontSize: "10px"}}>
                                      8/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore9"} style={{float: "left", fontSize: "10px"}}>
                                      9/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore stayAtHomeScore10"} style={{float: "left", fontSize: "10px"}}>
                                      10/10
                                    </div>
                                </td>
                                <td>
                                    <div className={"stayAtHomeScore"} style={{float: "left", fontSize: "10px"}}>
                                      N/A
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 100%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 50%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 20%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 10%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 5%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 2%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 1%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 0.5%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 0.2%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 0.1%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    &gt; 0%
                                </td>
                                <td className={"small text-muted"} style={{fontSize: "10px"}}>
                                    -
                                </td>
                            </tr>
                            <tr>
                                <td align={"center"} colSpan={12} className={"small"}>
                                    Containment Scores badges with growth rate thresholds
                                </td>
                            </tr>
                        </table>
                    </p>
                    <p>
                        <h5>Charts</h5>
                        <table cellPadding={3}>
                            <tr>
                                <td valign={"top"}>
                                    For every location we generate a bar chart that shows the progress of COVID-19 cases over time.
                                    The gray bar indicates the currently selected date of the replay mode (see above).
                                </td>
                                <td>
                                    <img src={"chart.png"} width={"200px"}/>
                                </td>
                            </tr>
                        </table>
                    </p>
                    <p>If you experience any issues or have suggestions on how to improve this application <a target="_blank" href="https://github.com/daniel-karl/covid19-map/issues">please let us know</a>.</p>
                    Stay healthy,<br />
                    <a target="_blank" href="https://github.com/daniel-karl/covid19-map#contributors">The contributors</a>
                </Modal.Body>
                <Modal.Footer className={"bg-light"}>
                  <Button variant="dark" onClick={()=>{this.setState({showModal: false})}}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            <div className={"small controls" + (that.state.minimized_controls ? " minimized" : "")}>
              {/*
                 <Form.Check inline className="small hideInJh" checked={that.state.momentum==="none" } label="Live situation" type={"radio"} name={"a"} id={`inline-radio-4`} onClick={() => {that.setState({momentum: "none"});}} />
                 <Form.Check inline className="small hideInJh" checked={that.state.momentum==="last1" } label="Momentum last 1 day" type={"radio"} name={"b"} id={`inline-radio-5`} onClick={() => {that.setState({momentum: "last1", chart: "pie"});}} />
                 <Form.Check inline className="small hideInJh" checked={that.state.momentum==="last3" } label="Momentum last 3 days" type={"radio"} name={"b"} id={`inline-radio-6`} onClick={() => {that.setState({momentum: "last3", chart: "pie"});}} />
                 <Form.Check inline className="small hideInJh" checked={that.state.momentum==="last7" } label="Momentum last 7 days" type={"radio"} name={"b"} id={`inline-radio-7`} onClick={() => {that.setState({momentum: "last7", chart: "pie"});}} />
              */}
              <button hidden={that.state.minimized_controls} className={"btn-collapse"} onClick={() => {
                that.setState({minimized_controls: true})
              }}>minimize <FontAwesomeIcon icon={faWindowMinimize}/></button>
              <button hidden={!that.state.minimized_controls} className={"btn-collapse"} onClick={() => {
                that.setState({minimized_controls: false})
              }}>settings
              </button>
              <div hidden={that.state.minimized_controls}>
                <span className="small text-muted mr-2">Mode:</span>
                <Tooltip
                    title={<span><b>Cumulative mode:</b> Glyphs show absolute numbers including live updates during the day.<br/><br/><b>Momentum mode:</b> Glyphs show growth (red) and shrinking (green) of active cases since last 1, 3 or 7 day(s).</span>}
                    small={"true"}
                    arrow
                    disableTouchListener={true}
                >
                  <span className="test"><FontAwesomeIcon icon={faQuestion} size={"xs"}/></span>
                </Tooltip><br />
                <FormControl>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={that.state.momentum}
                    onChange={(e) => {
                        that.setState({momentum: e.target.value, testmode: false, testscale: 0});
                    }}
                  >
                    <MenuItem value={"none"}>Cumulative</MenuItem>
                    <MenuItem value={"last1"}>Momentum (last 24 hours)</MenuItem>
                    <MenuItem value={"last3"}>Momentum (last 3 days)</MenuItem>
                    <MenuItem value={"last7"}>Momentum (last 7 days)</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                      <Checkbox
                          color="primary"
                          checked={this.state.showUScounties}
                          onChange={() => {
                              new JHDatasourceProvider().getDatasource(!that.state.showUScounties, (datasource) => {
                                  that.setState({
                                      showUScounties: !that.state.showUScounties,
                                      datasource: datasource
                                  });
                              });
                          }}
                      />
                  }
                  label={
                      <Tooltip
                      title="Show live US county data (slows perfomance of the application)."
                      small={"true"}
                      arrow
                      disableTouchListener={true}
                    >
                      <span>Include US counties<br />(reduces speed)</span>
                    </Tooltip>
                  }
                />
                <span className="small text-muted mr-2">Normalization:</span>
                <Tooltip
                    title="Scale the size of the glyphs on the map according to different criteria."
                    small={"true"}
                    arrow
                    disableTouchListener={true}
                >
                  <span className="test"><FontAwesomeIcon icon={faQuestion} size={"xs"}/></span>
                </Tooltip>
                <br/>
                <FormControlLabel
                  className={"higher"}
                  control={
                      <Checkbox
                          color="primary"
                          checked={that.state.logmode}
                          onChange={() => {
                              that.setState({
                                  logmode: !that.state.logmode
                              });
                          }}
                      />
                  }
                  label={
                      <Tooltip
                      title="Scales the size of the glyphs on the map logarithmically."
                      small={"true"}
                      arrow
                      disableTouchListener={true}
                    >
                      <span>Log</span>
                    </Tooltip>
                  }
                />
                <FormControlLabel
                  className={"higher"}
                  control={
                      <Checkbox
                          color="primary"
                          checked={that.state.ppmmode}
                          onChange={() => {
                              that.setState({
                                  ppmmode: !that.state.ppmmode
                              });
                          }}
                      />
                  }
                  label={
                      <Tooltip
                      title="Scales the size of the glyphs on the map according to the number of people in the location."
                      small={"true"}
                      arrow
                      disableTouchListener={true}
                    >
                      <span>Population</span>
                    </Tooltip>
                  }
                />
                <br/>
                {
                  that.state.momentum === "none" && !that.state.playmode &&
                  [
                    <span className="small text-muted mr-2">'What if?'-testing rates:</span>,
                    <Tooltip
                        title="Display how many confirmed cases there might be if local testing rate was coinciding with global average."
                        small={"true"}
                        arrow
                        disableTouchListener={true}
                    >
                      <span className={"test"}><FontAwesomeIcon icon={faQuestion} size={"xs"}/></span>
                    </Tooltip>,
                    <br/>,
                    <Slider
                      value={this.state.testscale}
                      defaultValue={this.state.testscale}
                      step={0.1}
                      min={0}
                      max={3}
                      marks={[
                          {value: 0, label: <span className={"text-muted small"}>off</span>},
                          {value: 1, label: <span className={"text-muted small"}>global average</span>}
                          ]}
                      onChange={(e,value) => {
                          this.state.logmode = false;
                          this.state.testscale = value;
                          this.state.testmode = true;
                          this.render();
                      }}
                    />,
                    <br/>
                  ]
                }
                <span className="small text-muted">Glyphs:</span><br/>
                <Form.Check inline className="small hideInJh" checked={that.state.glyphs==="mountains" } label="Mountains" type={"radio"} name={"a"} id={`inline-radio-glyphs-mountains`} onClick={() => {that.setState({glyphs: "mountains"});}} />
                <Form.Check inline className="small hideInJh" checked={that.state.glyphs==="candles" } label="Candles" type={"radio"} name={"a"} id={`inline-radio-glyphs-candles`} onClick={() => {that.setState({glyphs: "candles"});}} />
                <Form.Check inline className="small hideInJh" checked={that.state.glyphs==="bubbles" } label="Bubbles" type={"radio"} name={"a"} id={`inline-radio-glyphs-bubbles`} onClick={() => {that.setState({glyphs: "bubbles"});}} /><br />

                <span className="small text-muted mr-2">Glyph size:</span><br/>
                <Slider
                    value={this.state.factor}
                    defaultValue={this.state.factor}
                    step={1}
                    min={1}
                    max={100}
                    valueLabelDisplay="auto"
                    onChange={(e,value) => {
                        this.setState({factor: value});
                    }}
                /><br />
                  {/*<ReactBootstrapSlider value={this.state.factor} change={e => {
                  this.setState({factor: e.target.value});
                }} step={1} max={100} min={1}></ReactBootstrapSlider><br/>*/}
                {/*<Form.Check inline title="Represent data as bubbles. Hover bubbles on map to see more details." className="small" checked={that.state.chart==="pie" } label="Bubbles" type={"radio"} name={"a"} id={`inline-radio-1`} onChange={() => {that.setState({chart: "pie"});}}/><br />*/}
                {/*<Form.Check inline title="Represent data as vertical bars. Hover bars on map to see more details." className="small hideInMomentum" checked={that.state.chart==="bar" } label="Bars" type={"radio"} name={"a"} id={`inline-radio-2`} onChange={() => {that.setState({chart: "bar"});}} disabled={that.state.momentum!=="none" ? true : false}/>*/}
                {/*<Form.Check inline title="Represent data as horizontal pill. Hover pill on map to see more details." className="small hideInMomentum" checked={that.state.chart==="pill" } label="Pills" type={"radio"} name={"a"} id={`inline-radio-3`} onChange={() => {that.setState({chart: "pill"});}} disabled={that.state.momentum!=="none" ? true : false}/><br />*/}
                <span className="small text-muted">Map style:</span><br/>
                <FormControl>
                  <Select
                    labelId="map-style-select-label"
                    id="map-style-select"
                    value={that.state.mapstyle}
                    onChange={(e) => {
                        that.setState({mapstyle: e.target.value});
                    }}
                  >
                    <MenuItem value="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png">Light</MenuItem>
                    <MenuItem value="https://{s}.tile.osm.org/{z}/{x}/{y}.png">Color</MenuItem>
                    <MenuItem value="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png">Dark</MenuItem>
                  </Select>
                </FormControl>

                <div className={"credits"}>
                  <Badge><a target="_blank" className="text-secondary" rel="noopener noreferrer"
                            href={"https://github.com/daniel-karl/covid19-map/issues"}><FontAwesomeIcon
                      icon={faBug}/> Issues</a></Badge>
                  <Badge><a target="_blank" className="text-secondary" rel="noopener noreferrer"
                            href={"https://github.com/daniel-karl/covid19-map#about"}><FontAwesomeIcon
                      icon={faQuestionCircle}/> About</a></Badge>
                  <Badge><a target="_blank" className="text-secondary" rel="noopener noreferrer"
                            href={"https://github.com/daniel-karl/covid19-map/blob/master/LICENSE.txt"}><FontAwesomeIcon
                      icon={faBalanceScale}/> License</a></Badge>
                </div>
              </div>
            </div>
            <div className={"small timeline" + (that.state.minimized_timeline ? " minimized" : "") + (this.state.expandRaceChart ? " expanded" : "")}>
              <button
                  hidden={that.state.minimized_timeline}
                  className={"btn-collapse"}
                  onClick={() => {
                    that.setState({minimized_timeline: true, expandRaceChart: false})
                  }}
              >
                  minimize <FontAwesomeIcon icon={faWindowMinimize}/>
              </button>

              <button
                  hidden={that.state.minimized_timeline || that.state.expandRaceChart}
                  className={"btn-collapse expand"}
                  onClick={() => {
                    that.setState({expandRaceChart: true})
                  }}
              >
                  expand <FontAwesomeIcon icon={faWindowMaximize}/>
              </button>

              <button
                  hidden={that.state.minimized_timeline || !that.state.expandRaceChart}
                  className={"btn-collapse expand"}
                  onClick={() => {
                      that.setState({expandRaceChart: false})
                  }}
              >
                  restore <FontAwesomeIcon icon={faWindowRestore}/>
              </button>

              <button
                  hidden={!that.state.minimized_timeline}
                  className={"btn-collapse"}
                  onClick={() => {
                      that.setState({minimized_timeline: false})
                  }}
              >
                  timeline
              </button>
              <div hidden={that.state.minimized_timeline}>
                  <button disabled style={{opacity: 1, pointerEvents: "none"}} className={"btn btn-sm text-dark ml-0 pl-0"}>
                    <b>{new Date(ds.date).toLocaleDateString()}</b>
                  </button>
                  <div className={"race mb-1"}>
                    <RaceChart
                      datasource={this.state.datasource}
                      dayOffset={this.state.dayOffset}
                      logmode={this.state.logmode}
                      names={this.state.selectedLocations}
                      expanded={this.state.expandRaceChart}
                    />
                  </div>
                  <button
                      className={this.state.dayOffset < 0 ? "btn btn-sm btn-dark leftTime" : "btn btn-sm btn-outline-dark leftTime"}
                      style={{height: "30px", lineHeight: "20px"}}
                      onClick={() => {
                          this.setState({
                             dayOffset: this.state.dayOffset - 1,
                             testmode: false
                          });
                      }}
                  ><FontAwesomeIcon icon={faStepBackward}/></button>

                  <button
                      className={"btn btn-sm btn-secondary midTime"}
                      style={this.state.dayOffset < 0 && !this.state.playmode ? {
                        height: "30px",
                        lineHeight: "20px"
                      } : {display: "none"}}
                      onClick={() => {
                        this.state.dayOffset = Math.min(0, this.state.dayOffset + 1);
                        if (this.state.dayOffset === 0) {
                          this.state.playmode = false;
                        } else {
                          this.state.testmode = false;
                        }
                        this.render();
                      }}
                  ><FontAwesomeIcon icon={faStepForward}/></button>

                  <button
                      className={this.state.dayOffset < 0 ? "btn btn-sm btn-outline-danger todayTime" : "btn btn-sm btn-danger todayTime"}
                      style={{height: "30px", lineHeight: "20px"}}
                      onClick={() => {
                        this.setState({
                          dayOffset: 0
                        });
                      }}
                  >Latest</button>

                  <button
                      className={"btn btn-sm btn-success play"}
                      style={{height: "30px", lineHeight: "20px"}}
                      onClick={() => {
                        document.getElementsByClassName("todayTime")[0].style.display = "none";
                        document.getElementsByClassName("play")[0].style.display = "none";
                        document.getElementsByClassName("leftTime")[0].style.display = "none";
                        document.getElementsByClassName("midTime")[0].style.display = "none";

                        var now = new Date();
                        var startDate = new Date("January 22, 2020 00:00:00");
                        const oneDay = 24 * 60 * 60 * 1000;
                        this.setState({
                          dayOffset:  -Math.round(Math.abs((now - startDate) / oneDay)),
                          testmode: false,
                          testscale: 0,
                          playmode: true,
                          playpause: false
                        });
                        let interval = setInterval(() => {
                          if (!that.state.playmode) {
                            clearInterval(interval);
                            this.setState({
                                dayOffset: 0
                            });
                            return;
                          }
                          if (!this.state.playpause) {
                            this.setState({
                                dayOffset: this.state.dayOffset + 1
                            });
                            if (this.state.dayOffset === 0) {
                              document.getElementsByClassName("todayTime")[0].style.display = "inline";
                              document.getElementsByClassName("play")[0].style.display = "inline";
                              document.getElementsByClassName("leftTime")[0].style.display = "inline";
                              document.getElementsByClassName("midTime")[0].style.display = "none";
                              this.setState({
                                 playmode: false,
                                 testscale: 0,
                                 testmode: false
                              });
                            }
                          }
                        }, 500);
                      }}
                  ><FontAwesomeIcon icon={faPlayCircle}/></button>

                  <button
                      className={"btn btn-sm pause " + (this.state.playpause ? "btn-success" : "btn-outline-dark")}
                      style={this.state.playmode ? {height: "30px", lineHeight: "20px"} : {display: "none"}}
                      onClick={() => {
                          this.setState({
                              playpause: !this.state.playpause
                          });
                      }}
                  >
                    {
                      !this.state.playpause &&
                      [<FontAwesomeIcon icon={faPauseCircle}/>, " Pause"]
                    }
                    {
                      this.state.playpause &&
                      [<FontAwesomeIcon icon={faPlayCircle}/>, " Continue"]
                    }
                  </button>

                  <button
                      className={"btn btn-sm btn-danger stop"}
                      style={this.state.playmode ? {height: "30px", lineHeight: "20px"} : {display: "none"}}
                      onClick={() => {
                        document.getElementsByClassName("todayTime")[0].style.display = "inline";
                        document.getElementsByClassName("play")[0].style.display = "inline";
                        document.getElementsByClassName("leftTime")[0].style.display = "inline";
                        document.getElementsByClassName("midTime")[0].style.display = "none";
                        this.state.playmode = false;
                        this.state.testscale = 0;
                        this.render();
                      }}
                  ><FontAwesomeIcon icon={faStopCircle}/> Stop
                  </button>
              </div>
            </div>
            {
              that.state.momentum !== "none" &&
              <style dangerouslySetInnerHTML={{
                __html: `
                  .hideInMomentum {
                    display: none !important;
                  }
                  .showInMomentum {
                    display: block !important;
                  }`
              }}/>
            }
            {that.leafletMap(ds)}
            {that.leaderboard(ds)}
          </>
      );
    }
  }

  leaderboard = (ds) => {
    return (
      <div className="leaderboard">
        <table>
          <thead>
            <tr>
              <td className={"p-1 valign-top text-muted"}></td>
              <td className={"p-1 bg-danger text-light sortHeader"} align={"center"}>
                <LightTooltip
                  title={
                    <div style={{textAlign: "justify"}}>
                      Sort by <b>active cases</b>
                    </div>
                  }
                  small={"true"}
                  disableTouchListener={true}
                >
                  <a
                    onClick={() => {
                      this.setState({
                        leadership: "active"
                      });
                    }}><FontAwesomeIcon icon={faProcedures} size={"lg"}/>
                  </a>
                </LightTooltip>
              </td>
              <td className={"p-1 sortHeader"}>
                <LightTooltip
                  title={
                    <div style={{textAlign: "justify"}}>
                      Sort by <b>location</b>
                    </div>
                  }
                  small={"true"}
                  disableTouchListener={true}
                >
                  <a
                    onClick={() => {
                      this.setState({
                        leadership: "name"
                      });
                    }}
                  >Location</a>
                </LightTooltip>
              </td>
              <td className={"p-1 sortHeader"} align={"center"}>
              <LightTooltip
                title={
                  <div style={{textAlign: "justify"}}>
                    <b>Containment Score</b> reflects the spread of COVID19
                    in this region, based on weighted average growth
                    of confirmed cases over the past 1, 3 and 7 days. From worst (0/10) to best (10/10).
                  </div>
                }
                small={"true"}
                disableTouchListener={true}
              >
                <a
                  onClick={() => {
                    this.setState({
                      leadership: "containmentScore"
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faShieldAlt} size={"lg"}/>
                </a>
              </LightTooltip>
              </td>
              <td className={"p-1 text-danger sortHeader"} align={"center"}>
                <LightTooltip
                  title={
                    <div style={{textAlign: "justify"}}>
                      Sort by <b>confirmed cases</b>
                    </div>
                  }
                  small={"true"}
                  disableTouchListener={true}
                >
                  <a
                    onClick={() => {
                      this.setState({
                        leadership: "confirmed"
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faBiohazard} size={"lg"}/>
                  </a>
                </LightTooltip>
              </td>
              <td className={"p-1 text-success sortHeader"} align={"center"}>
                <LightTooltip
                  title={
                    <div style={{textAlign: "justify"}}>
                      Sort by <b>recovered cases</b>
                    </div>
                  }
                  small={"true"}
                  disableTouchListener={true}
                >
                  <a
                    onClick={() => {
                      this.setState({
                        leadership: "recovered"
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faHeartbeat} size={"lg"}/>
                  </a>
                </LightTooltip>
              </td>
              <td className={"p-1 text-dark sortHeader"} align={"center"}>
                <LightTooltip
                  title={
                    <div style={{textAlign: "justify"}}>
                      Sort by <b>deceased cases</b>
                    </div>
                  }
                  small={"true"}
                  disableTouchListener={true}
                >
                  <a
                    onClick={() => {
                      this.setState({
                        leadership: "deceased"
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faHeartBroken} size={"lg"}/>
                  </a>
                </LightTooltip>
              </td>
              <td className={"p-1 text-primary sortHeader"} align={"center"}>
                <LightTooltip
                  title={
                    <div style={{textAlign: "justify"}}>
                      Sort by <b>tested</b>
                    </div>
                  }
                  small={"true"}
                  disableTouchListener={true}
                >
                  <a
                    onClick={() => {
                      this.setState({
                        leadership: "tested"
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faVial} size={"lg"}/>
                  </a>
                </LightTooltip>
              </td>
            </tr>
          </thead>
          <tbody>
            {
              Object.keys(ds.data).filter((value, index) => {
                  return this.count(value, ",") < 2;
              }).sort((a, b) => {
                let mode = this.state.ppmmode ? "ppm" : "absolute";
                let ca = a;
                let cb = b;
                if (this.state.leadership==="name") {
                  let c = a;
                  ca = b;
                  cb = c;
		        }
                else if (this.state.leadership==="containmentScore") {
                  ca = ds.data[a].containmentScore;
                  cb = ds.data[b].containmentScore;

		        }
                else if (this.state.leadership==="tested") {
                  ca = this.state.ppmmode ? Testing.RATES[a]*ONE_M/Population.ABSOLUTE[a] : Testing.RATES[a];
                  ca = (isNaN(ca)) ? 0 : ca;
                  cb = this.state.ppmmode ? Testing.RATES[b]*ONE_M/Population.ABSOLUTE[b] : Testing.RATES[b];
                  cb = (isNaN(cb)) ? 0 : cb;
                }
                else {
                  let dataMode = "current";
                  if(this.state.momentum === "last1") {
                      dataMode = "growthLast1Day";
                  } else if (this.state.momentum === "last3") {
                      dataMode = "growthLast3Days";
                  } else if (this.state.momentum === "last7") {
                      dataMode = "growthLast7Days";
                  }
                  ca = ds.data[a][mode][dataMode][this.state.leadership];
                  ca = isNaN(ca) ? 0 : ca;
                  cb = ds.data[b][mode][dataMode][this.state.leadership];
                  cb = isNaN(cb)  ? 0 : cb;
                }
                if(ca === null && cb === null) {
                  return 0;
                } else if(ca === null) {
                  return 1;
                } else if(cb === null) {
                  return -1;
                } else {
                  return (ca >= cb) ? -1 : 1;
                }
              }).map((name, locationIndex) => {
                if(name !== "Canada") {
                  let dataMode = "current";
                  if(this.state.momentum === "last1") {
                      dataMode = "growthLast1Day";
                  } else if (this.state.momentum === "last3") {
                      dataMode = "growthLast3Days";
                  } else if (this.state.momentum === "last7") {
                      dataMode = "growthLast7Days";
                  }
                  let confirmed = (this.state.ppmmode) ? ds.data[name].ppm[dataMode].confirmed : ds.data[name].absolute[dataMode].confirmed;
                  let active = (this.state.ppmmode) ? ds.data[name].ppm[dataMode].active : ds.data[name].absolute[dataMode].active;
                  active = isNaN(active) ? "N/A" : active;
                  let recovered = (this.state.ppmmode) ? ds.data[name].ppm[dataMode].recovered : ds.data[name].absolute[dataMode].recovered;
                  let deceased = (this.state.ppmmode) ? ds.data[name].ppm[dataMode].deceased : ds.data[name].absolute[dataMode].deceased;
                  let containmentScore = ds.data[name].containmentScore;
                  if(containmentScore === null) {
                    containmentScore = "N/A";
                  }
                  let tested = this.state.ppmmode ? Testing.RATES[name]*ONE_M/Population.ABSOLUTE[name] : Testing.RATES[name];
                  return (
                    <tr
                        className="locationSelect"
                        onClick={() =>{
                            if(!this.state.selectedLocations.includes(name)) {
                                this.state.selectedLocations.pop();
                                this.state.selectedLocations.push(name);
                            }
                            this.setState({
                                lng: this.state.datasource.locations[name][0],
                                lat: this.state.datasource.locations[name][1],
                                zoom: 6
                            })
                        }}
                    >
                      <td className={"p-1 valign-top text-muted mono"} align={"center"}>{locationIndex + 1}</td>
                      <td className={"p-1 valign-top stat bg-danger text-light"} align={"right"}>{(this.state.momentum !== "none" && active >= 0 ? "+" : "") + Utils.rounded(active)}</td>
                      <td className={"p-1 valign-top country"}>{name}</td>
                      <td className={"p-1 valign-top"}>
                        <div className={"containmentScore containmentScore" + containmentScore}>
                          {containmentScore}{containmentScore !== "N/A" ? "/10" : ""}
                        </div>
                      </td>
                      <td className={"p-1 valign-top stat text-danger"} align={"right"}>{(this.state.momentum !== "none" && confirmed >= 0 ? "+" : "") + Utils.rounded(confirmed)}</td>
                      <td className={"p-1 valign-top stat text-success"} align={"right"}>{(this.state.momentum !== "none" && recovered >= 0 ? "+" : "") + Utils.rounded(recovered)}</td>
                      <td className={"p-1 valign-top stat text-dark"} align={"right"}>{(this.state.momentum !== "none" && deceased >= 0 ? "+" : "") + Utils.rounded(deceased)}</td>
                      <td className={"p-1 valign-top stat text-primary"} align={"right"}>{Utils.rounded(tested)}</td>
                    </tr>
                  )
                }
              })
            }
          </tbody>
        </table>
      </div>
    );
  };

  handleZoom = () => {
    this.setState({zoom: this.map.leafletElement.getZoom()});
  };

  leafletMap = (ds) => {
    const position = [this.state.lat, this.state.lng];
    return (
      <Map ref={(ref) => { this.map = ref}} center={position} zoom={this.state.zoom} zoomControl={false} onZoomEnd={this.handleZoom}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url={this.state.mapstyle}
        />

        <LayerGroup key={5}>
          { this.momentumMarkers(ds) }
        </LayerGroup>

        <LayerGroup key={4} className={"projectedLayer"}>
          { this.projectedMarkers(ds) }
        </LayerGroup>

        <LayerGroup key={3} className={"confirmedLayer"}>
          { this.confirmedMarkers(ds) }
        </LayerGroup>

        <LayerGroup key={2} className={"recoveredLayer"}>
          { this.recoveredMarkers(ds) }
        </LayerGroup>

        <LayerGroup key={1} className={"deceasedLayer"}>
          { this.deceasedMarkers(ds) }
        </LayerGroup>
      </Map>
    );
  };

  momentumMarkers = (ds) => {
    return (
      this.state.momentum !== "none" &&
      Object.keys(ds.data).map((name, locationIndex) => {
        let markers = [];
        if(ds.data[name].absolute.current.confirmed === -1) {
            return;
        }
        let pop = Population.ABSOLUTE[name];
        let coordinates = this.state.datasource.locations[name];

        // active cases
        let size;
        switch (this.state.momentum) {
          case "last1":
            size = ds.data[name].absolute.growthLast1Day.active / this.state.datasource.absoluteMaxValue;
            break;
          case "last3":
            size = ds.data[name].absolute.growthLast3Days.active / this.state.datasource.absoluteMaxValue;
            break;
          case "last7":
            size = ds.data[name].absolute.growthLast7Days.active / this.state.datasource.absoluteMaxValue;
            break;
        }
        if(size !== 0) {
            let pos = size >= 0;
            size = Math.abs(size);
            size = this.scaleLog(size);
            size = this.scaleLogAndPpm(size);
            markers.push(
                <CircleMarker
                    className={"confirmed"}
                    key={"change_" + locationIndex}
                    style={this.state.chart === "pie" ? {display: "block"} : {display: "none"}}
                    center={[coordinates[1], coordinates[0]]}
                    fillColor={pos ? "#dc3545" : "#28a745"}
                    radius={isNaN(size) ? 0 : Math.sqrt(size) * this.state.factor}
                    opacity={0}
                    fillOpacity={0.5}
                >
                    <LTooltip direction="bottom" offset={[0, 20]} opacity={1} className={"markerTooltip"}>
                        {
                            this.momentumTooltip(name, ds.data[name])
                        }
                    </LTooltip>
                </CircleMarker>
            );
        }


        // deceased cases
        switch (this.state.momentum) {
          case "last1":
            size = ds.data[name].absolute.growthLast1Day.deceased / this.state.datasource.absoluteMaxValue;
            break;
          case "last3":
            size = ds.data[name].absolute.growthLast3Days.deceased / this.state.datasource.absoluteMaxValue;
            break;
          case "last7":
            size = ds.data[name].absolute.growthLast7Days.deceased / this.state.datasource.absoluteMaxValue;
            break;
        }
        size = Math.abs(size);
        if(size !== 0) {
            size = this.scaleLog(size);
            size = this.scaleLogAndPpm(size);
            markers.push(
                <CircleMarker
                    className={"deceased"}
                    key={"change_" + locationIndex}
                    style={this.state.chart === "pie" ? {display: "block"} : {display: "none"}}
                    center={[coordinates[1], coordinates[0]]}
                    fillColor={"#000000"}
                    radius={isNaN(size) ? 0 : Math.sqrt(size) * this.state.factor}
                    opacity={0}
                    fillOpacity={0.8}
                >
                    <LTooltip direction="bottom" offset={[0, 20]} opacity={1} className={"markerTooltip"}>
                        {
                            this.momentumTooltip(name, ds.data[name])
                        }
                    </LTooltip>
                </CircleMarker>
            );
        }
        return markers;
      })
    );
  };

  /*<Marker coordinates={coordinates} key={"change_" + rowId}>
              <circle r={isNaN(size)?0:Math.sqrt(size) * this.state.factor} fill={pos ? "#F008" : "#0F08"} />
              <title>
                {`${name} - ${Math.abs(val)} ${pos ? "INCREASE" : "DECREASE"} in active(= confirmed-recovered) cases (excl. deceased) (${Math.round(ONE_M*val/pop)} ppm)`
                }
              </title>
              <text
                textAnchor="middle"
                y={markerOffset}
                style={{ fontSize: name.endsWith(", US") ? "0.005em" : "2px", fontFamily: "Arial", fill: "#5D5A6D33", pointerEvents: "none" }}
              >
                {name}
              </text>
            </Marker>*/

  projectedMarkers = (ds) => {
    let that = this;
    return (
      this.state.momentum==="none" &&
        Object.keys(ds.data).map((name, locationIndex) => {
          let value = ds.data[name].absolute.current.confirmedProjected / that.state.datasource.absoluteMaxValue * that.state.testscale;
          if(this.state.ppmmode) {
              value = ds.data[name].ppm.current.confirmedProjected / that.state.datasource.ppmMaxValue * that.state.testscale;
          }
          let size = this.scale(value, Population.ABSOLUTE[name]);
          return this.marker(locationIndex, that.state.datasource.locations[name], "#007bff", size, ds.data[name], name, "projected", 0.8, -1);
        })
    )
  };

  confirmedMarkers = (ds) => {
    let that = this;
    return (
      this.state.momentum==="none" &&
        Object.keys(ds.data).map((name, locationIndex) => {
          let value = ds.data[name].absolute.current.confirmed / that.state.datasource.absoluteMaxValue;
          if(this.state.ppmmode) {
              value = ds.data[name].ppm.current.confirmed / that.state.datasource.ppmMaxValue;
          }
          let size = this.scale(value, Population.ABSOLUTE[name]);
          return this.marker(locationIndex, that.state.datasource.locations[name], "#dc3545", size, ds.data[name], name, "confirmed", 0.8, -1);
        })
    )
  };

  recoveredMarkers = (ds) => {
    let that = this;
    return (
      this.state.momentum==="none" &&
        Object.keys(ds.data).map((name, locationIndex) => {
          let value = ds.data[name].absolute.current.recovered / that.state.datasource.absoluteMaxValue;
          if(this.state.ppmmode) {
              value = ds.data[name].ppm.current.recovered / that.state.datasource.ppmMaxValue;
          }
          if(this.state.glyph !== "mountains") {
              value += ds.data[name].absolute.current.deceased / that.state.datasource.absoluteMaxValue;
              if(this.state.ppmmode) {
                  value += ds.data[name].ppm.current.deceased / that.state.datasource.ppmMaxValue;
              }
          }
          let size = this.scale(value, Population.ABSOLUTE[name]);
          return this.marker(locationIndex, that.state.datasource.locations[name], "#28a745", size, ds.data[name], name, "recovered", 0.8, 0);
        })
    )
  };

  deceasedMarkers = (ds) => {
    let that = this;
    return (
      this.state.momentum==="none" &&
        Object.keys(ds.data).map((name, locationIndex) => {
          let value = ds.data[name].absolute.current.deceased / that.state.datasource.absoluteMaxValue;
          if(this.state.ppmmode) {
              value = ds.data[name].ppm.current.deceased / that.state.datasource.ppmMaxValue;
          }
          let size = this.scale(value, Population.ABSOLUTE[name]);
          return this.marker(locationIndex, that.state.datasource.locations[name], "#212529", size, ds.data[name], name, "deceased", 0.9, +1);
        })
    )
  };

  marker = (index, coordinates, color, size, data, name, type, opacity, offset) => {
    let zoom = 1;
    switch (this.state.zoom) {
        case 0:
            zoom = 10;
            break;
        case 1:
            zoom = 7.5;
            break;
        case 2:
            zoom = 5;
            break;
        case 3:
            zoom = 2;
            break;
        case 4:
            zoom = 1.5;
            break;
        case 5:
            zoom = 1;
            break;
        case 6:
            zoom = 0.75;
            break;
        case 7:
            zoom = 0.5;
            break;
        case 8:
            zoom = 0.2;
            break;
        case 9:
            zoom = 0.1;
            break;
        case 10:
            zoom = 0.075;
            break;
        case 11:
            zoom = 0.05;
            break;
        case 12:
            zoom = 0.02;
            break;
        case 13:
            zoom = 0.01;
            break;
        case 14:
            zoom = 0.0075;
            break;
        case 15:
            zoom = 0.005;
            break;
        case 16:
            zoom = 0.002;
            break;
        case 17:
            zoom = 0.001;
            break;
        case 18:
            zoom = 0.00075;
            break;
    }

    let diffX = 0.5 * zoom * Math.sqrt(this.state.factor / 200);
    let diffY = isNaN(size) ? 0 : (size * this.state.factor < 0) ? 0 : size * (this.state.factor / 2);
    let corner0 = [Number(coordinates[1]), Number(coordinates[0]) - diffX];
    let corner1 = [Number(coordinates[1]) + diffY * zoom, Number(coordinates[0]) + diffX];

    let latLngs = [
        [ Number(coordinates[1]), Number(coordinates[0]) - diffX ],
        [ Number(coordinates[1]) + diffY * zoom, Number(coordinates[0])],
        [ Number(coordinates[1]), Number(coordinates[0]) + diffX ]
    ];

    if (this.state.glyphs === "mountains") {
        if(offset < 0) {
            latLngs[0][1] -= diffX;
            latLngs[1][1] -= diffX;
            latLngs[2][1] -= diffX;
        } else if (offset > 0) {
            latLngs[0][1] += diffX;
            latLngs[1][1] += diffX;
            latLngs[2][1] += diffX;
        }
    }

    if(size > 0 && name !== "Canada") {
        if (this.state.glyphs === "bubbles") {
            return (
                // bubble
                <CircleMarker
                    className={type}
                    key={type + "_" + index}
                    center={[coordinates[1], coordinates[0]]}
                    fillColor={color}
                    radius={size && size > 0 ? Math.sqrt(size) * this.state.factor : 0}
                    opacity={0}
                    fillOpacity={opacity}
                    onClick={() => {
                        this.state.selectedLocations.pop();
                        this.state.selectedLocations.push(name);
                        this.setState({});
                    }}
                >
                    <LTooltip direction="bottom" offset={[0, 20]} opacity={1} className={"markerTooltip"}>
                        {
                            this.tooltip(name, data)
                        }
                    </LTooltip>
                </CircleMarker>
            );
        } else if (this.state.glyphs == "candles") {
            return (
                <Rectangle
                    className={type}
                    key={type + "_" + index}
                    fillColor={color}
                    bounds={[corner0, corner1]}
                    opacity={0}
                    fillOpacity={opacity}
                    onClick={() => {
                        this.state.selectedLocations.pop();
                        this.state.selectedLocations.push(name);
                        this.setState({});
                    }}
                >
                    <LTooltip direction="bottom" offset={[0, 20]} opacity={1} className={"markerTooltip"}>
                        {
                            this.tooltip(name, data)
                        }
                    </LTooltip>
                </Rectangle>
            );
        } else if (this.state.glyphs == "mountains") {

            return (
                <Polygon
                    className={type}
                    key={type + "_" + index}
                    fillColor={color}
                    opacity={0}
                    positions={latLngs}
                    fillOpacity={opacity}
                    onClick={() => {
                        this.state.selectedLocations.pop();
                        this.state.selectedLocations.push(name);
                        this.setState({});
                    }}
                >
                    <LTooltip direction="bottom" offset={[0, 20]} opacity={1} className={"markerTooltip"}>
                        {
                            this.tooltip(name, data)
                        }
                    </LTooltip>
                </Polygon>
            );
        }
    }
    return "";
  };

  momentumTooltip = (name, data) => {
      let mode = this.state.ppmmode ? "ppm" : "absolute";
      let unit = this.state.ppmmode ? "ppm" : "";
      let dataMode;
      switch(this.state.momentum) {
          case "last1":
              dataMode = "growthLast1Day";
              break;
          case "last3":
              dataMode = "growthLast3Days";
              break;
          case "last7":
              dataMode = "growthLast7Days";
              break;
      }
      let confirmed = data[mode][dataMode].confirmed;
      let recovered = data[mode][dataMode].recovered;
      let deceased = data[mode][dataMode].deceased;
      let active = data[mode][dataMode].active;
      let containmentScore = data.containmentScore;
      if(containmentScore === null) {
        containmentScore = "N/A";
      }
      return (
        <div>
            <div>
                <b>{name}</b><br/>
                <FontAwesomeIcon icon={faUsers}/> {Utils.rounded(Population.ABSOLUTE[name])}
                &nbsp;&middot;&nbsp;
                <span className={"text-danger"}>
                    <FontAwesomeIcon icon={faBiohazard}/>&nbsp;
                    {<span>{(this.state.momentum !== "none" && confirmed >= 0 ? "+" : "") + Utils.rounded(confirmed)} {unit}</span>}
                </span>
                &nbsp;&middot;&nbsp;
                <span className={"text-success"}>
                    <FontAwesomeIcon icon={faHeartbeat}/>&nbsp;
                    {<span>{(this.state.momentum !== "none" && recovered >= 0 ? "+" : "") + Utils.rounded(recovered)} {unit}</span>}
                </span>
                &nbsp;&middot;&nbsp;
                <span className={"text-dark"}>
                    <FontAwesomeIcon icon={faHeartBroken}/>&nbsp;
                    {<span>{(this.state.momentum !== "none" && deceased >= 0 ? "+" : "") + Utils.rounded(deceased)} {unit}</span>}
                </span>
            </div>
            <div>
                <Badge variant={"danger"}>
                <FontAwesomeIcon icon={faProcedures}/>&nbsp;
                    {<span>{(this.state.momentum !== "none" && active >= 0 ? "+" : "") + Utils.rounded(active)} {unit}</span>}
                </Badge>
            </div>
            <div className="stayAtHomeScoreLabel">
            {
              [
                <span className="stayAtHomeAdvice">{this.stayAtHomeAdvice(data.absolute.current.active)}</span>,
                <br/>
              ]
            }
            <table>
              <tbody>
                <tr>
                  <td valign={"top"}>
                    <div className={`stayAtHomeScore stayAtHomeScore${containmentScore}`}>
                      {containmentScore}{containmentScore !== "N/A" ? "/10" : ""}
                    </div>
                  </td>
                  <td>
                    <div>
                      <i>Containment Score</i> reflects the spread of COVID19<br />
                      in the region, based on weighted average growth<br />
                      of confirmed cases over the past 1, 3 and 7 days.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td><FontAwesomeIcon icon={faExclamationTriangle}/> <b>Continue to follow the advice of the WHO<br/>and your local administration.</b></td>
                </tr>
                {
                  this.state.ppmmode &&
                  <tr>
                    <td></td>
                    <td><span className="text-muted">ppm: confirmed cases per one million people</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <BarChart
            datasource={this.state.datasource}
            name={name}
            logmode={this.state.logmode}
            dayOffset={this.state.dayOffset}
          />
          <br />
          <div className={"text-center"}>
              Plot shows data scaled <b>{this.state.logmode ? "logarithmically" : "linearly "}</b>  over time.<br /><i>It is currently insensitive to population size.</i>
          </div>
        </div>
      );
  };


  tooltip = (name, data) => {
    let mode = this.state.ppmmode ? "ppm" : "absolute";
    let unit = this.state.ppmmode ? "ppm" : "";
    let containmentScore = data.containmentScore;
    if(containmentScore === null) {
      containmentScore = "N/A";
    }
    try {
      return (
        <div>
          <div>
              <b>{name}</b><br />
              <FontAwesomeIcon icon={faUsers}/> {Utils.rounded(Population.ABSOLUTE[name])}
              &nbsp;&middot;&nbsp;
              <span className={"text-danger"}>
                <FontAwesomeIcon icon={faBiohazard}/>&nbsp;
                {<span>{Utils.rounded(data[mode].current.confirmed)} {unit}</span>}
              </span>
              &nbsp;&middot;&nbsp;
              <span className={"text-success"}>
                <FontAwesomeIcon icon={faHeartbeat}/>&nbsp;
                {<span>{Utils.rounded(data[mode].current.recovered)} {unit}</span>}
              </span>
              &nbsp;&middot;&nbsp;
              <span className={"text-dark"}>
                <FontAwesomeIcon icon={faHeartBroken}/>&nbsp;
                {<span>{Utils.rounded(data[mode].current.deceased)} {unit}</span>}
              </span>
          </div>
          <div>
            {
              data[mode].current.confirmedProjected > data[mode].current.confirmed && this.state.testmode && this.state.testscale > 0 &&
              [
                <Badge className={"text-primary"}>
                  <FontAwesomeIcon icon={faBiohazard}/>&nbsp;
                  &gt;{<span>{Utils.rounded(data[mode].current.confirmedProjected * this.state.testscale)} {unit} projected at {this.state.testscale}x global avg. testing rate</span>}
                </Badge>,
                <br />
              ]
            }
            <Badge variant={"danger"}>
                <FontAwesomeIcon icon={faProcedures}/>&nbsp;
                {<span>{Utils.rounded(data[mode].current.active)} {unit} active</span>}
            </Badge>
            &nbsp;&middot;&nbsp;
            <Badge variant={"primary"}>
                <FontAwesomeIcon icon={faVial}/>&nbsp;
                { Testing.RATES[name] && <span>{(Population.ABSOLUTE[name]&&this.state.ppmmode)?Utils.rounded(Testing.RATES[name]*ONE_M/Population.ABSOLUTE[name]) +" ppm":Utils.rounded(Testing.RATES[name])} tested</span>}
                { !Testing.RATES[name] && <span>No testing data</span>}
            </Badge>
            <br/>
          </div>
          <div className="stayAtHomeScoreLabel">
            {
              [
                <span className="stayAtHomeAdvice">{this.stayAtHomeAdvice(data.absolute.current.active)}</span>,
                <br/>
              ]
            }
            <table>
              <tbody>
                <tr>
                  <td valign={"top"}>
                    <div className={`stayAtHomeScore stayAtHomeScore${containmentScore}`}>
                      {containmentScore}{containmentScore !== "N/A" ? "/10" : ""}
                    </div>
                  </td>
                  <td>
                    <div>
                      <i>Containment Score</i> reflects the spread of COVID19<br />
                      in the region, based on weighted average growth<br />
                      of confirmed cases over the past 1, 3 and 7 days.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td><FontAwesomeIcon icon={faExclamationTriangle}/> <b>Continue to follow the advice of the WHO<br/>and your local administration.</b></td>
                </tr>
                {
                  this.state.ppmmode &&
                  <tr>
                    <td></td>
                    <td><span className="text-muted">ppm: confirmed cases per one million people</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <BarChart
            datasource={this.state.datasource}
            name={name}
            logmode={this.state.logmode}
            dayOffset={this.state.dayOffset}
          />
          <br />
          <div className={"text-center"}>
              Plot shows data scaled <b>{this.state.logmode ? "logarithmically" : "linearly "}</b>  over time.<br /><i>It is currently insensitive to population size.</i>
          </div>
        </div>
      )
    } catch(e) {
      console.log(e);
      return "Could not load tooltip data.";
    }
  };

  stayAtHomeAdvice = (active) => {
    if(active > 150) {
      return "You save lives by staying at home today!"
    }
    if (active > 0) {
      return "Avoid crowds! Keep social distance!";
    }
    return "No active cases detected in this region.";
  };

      /*

        <Marker coordinates={coordinates} key={type + "_" + rowId}>
          // pill
          <rect
              fill={color + transparency}
              style={this.state.chart === "pill" ? {display: "block"} : {display: "none"}}
              x={isNaN(size) ? 0 : -size * this.state.factor / 2}
              y={-this.state.width / 2 * 3}
              height={(this.state.width < 0) ? 0 : this.state.width * 3}
              width={isNaN(size) ? 0 : (size * this.state.factor > 0) ? size * this.state.factor : 0}
              onMouseOver={() => {
                if (rowId < 0) {
                  this.state.setTooltipContent(`Could not retrieve data for ${name}.`);
                } else {
                  let active = that.confirmed[rowId].val - that.recoveredAbsByRowId[rowId] - that.deathsAbsByRowId[rowId];
                  this.state.setTooltipContent(
                      <div>
                        <b>{name}</b> &nbsp;
                        <span><FontAwesomeIcon icon={faUsers}/> {rounded(Population.ABSOLUTE[name])}</span><br/>
                        <span><FontAwesomeIcon
                            icon={faBiohazard}/> {rounded(that.confirmed[rowId].val)} confirmed (>{rounded(that.projected[rowId].val)} at avg. test rate)</span><br/>
                        <span><FontAwesomeIcon icon={faProcedures}/> {rounded(active)} active</span>
                        &nbsp;<span><FontAwesomeIcon
                          icon={faHeartbeat}/> {rounded(that.recovered[rowId].val)} recovered</span>
                        &nbsp;<span><FontAwesomeIcon
                          icon={faHeartBroken}/> {rounded(that.deaths[rowId].val)} deceased</span>
                      </div>
                  );
                }
              }}
              onMouseOut={() => {
                this.state.setTooltipContent("");
              }}
          />

          // bar
          <rect
              fill={color + transparency}
              style={this.state.chart === "bar" ? {display: "block"} : {display: "none"}}
              x={this.state.width * 3 * 2 - this.state.width * 3 * 1.5}
              y={isNaN(size) ? 0 : -size * this.state.factor}
              height={isNaN(size) ? 0 : (size * this.state.factor < 0) ? 0 : size * this.state.factor}
              width={(this.state.width < 0) ? 0 : this.state.width * 3}
              onMouseOver={() => {
                if (rowId < 0) {
                  this.state.setTooltipContent(`Could not retrieve data for ${name}.`);
                } else {
                  let active = that.confirmed[rowId].val - that.recoveredAbsByRowId[rowId] - that.deathsAbsByRowId[rowId];
                  this.state.setTooltipContent(
                      <div>
                        <b>{name}</b> &nbsp;
                        <span><FontAwesomeIcon icon={faUsers}/> {rounded(Population.ABSOLUTE[name])}</span><br/>
                        <span><FontAwesomeIcon
                            icon={faBiohazard}/> {rounded(that.confirmed[rowId].val)} confirmed (>{rounded(that.projected[rowId].val)} at avg. test rate)</span><br/>
                        <span><FontAwesomeIcon icon={faProcedures}/> {rounded(active)} active</span>
                        &nbsp;<span><FontAwesomeIcon
                          icon={faHeartbeat}/> {rounded(that.recovered[rowId].val)} recovered</span>
                        &nbsp;<span><FontAwesomeIcon
                          icon={faHeartBroken}/> {rounded(that.deaths[rowId].val)} deceased</span>
                      </div>
                  );
                }
              }}
              onMouseOut={() => {
                this.state.setTooltipContent("");
              }}
          />

          // bubble
          <circle
              fill={color + transparency}
              style={this.state.chart === "pie" ? {display: "block"} : {display: "none"}}
              r={size && size > 0 ? Math.sqrt(size) * this.state.factor : 0}
              onMouseOver={() => {
                if (rowId < 0) {
                  this.state.setTooltipContent(`Could not retrieve data for ${name}.`);
                } else {
                  let active = that.confirmed[rowId].val - that.recoveredAbsByRowId[rowId] - that.deathsAbsByRowId[rowId];
                  this.state.setTooltipContent(
                      <div>
                        <b>{name}</b> &nbsp;
                        <span><FontAwesomeIcon icon={faUsers}/> {rounded(Population.ABSOLUTE[name])}</span><br/>
                        <span><FontAwesomeIcon
                            icon={faBiohazard}/> {rounded(that.confirmed[rowId].val)} confirmed (>{rounded(that.projected[rowId].val)} at avg. test rate)</span><br/>
                        <span><FontAwesomeIcon icon={faProcedures}/> {rounded(active)} active</span>
                        &nbsp;<span><FontAwesomeIcon
                          icon={faHeartbeat}/> {rounded(that.recovered[rowId].val)} recovered</span>
                        &nbsp;<span><FontAwesomeIcon
                          icon={faHeartBroken}/> {rounded(that.deaths[rowId].val)} deceased</span>
                      </div>
                  );
                }
              }}
              onMouseOut={() => {
                this.state.setTooltipContent("");
              }}
          />

          <title>{text}</title>
        </Marker>
      */

  scale = (value, population) => {
    value = this.scaleIfPillOrBar(value);
    if(!this.state.logmode && this.state.ppmmode) {
        value /= 5;
    }
    value = this.scaleLog(value);
    return value;
  };

  scaleIfPillOrBar = (value) => {
    if(this.state.chart==="pill" || this.state.chart==="bar") {
      return value * 10;
    }
    return value;
  };

  scaleLog = (value) => {
    if(!this.state.logmode) {
      return value;
    }
    if(value > 0) {
        if(!this.state.ppmmode) {
            value = Math.log(value * this.state.datasource.absoluteMaxValue) / Math.log(this.state.datasource.absoluteMaxValue) / 20;
        } else {
            value = Math.log(value * this.state.datasource.ppmMaxValue) / Math.log(this.state.datasource.ppmMaxValue) / 20;
        }
        return value;
    }
    return 0;
  };

  scaleLogAndPpm = (value) => {
    if(this.state.logmode && this.state.ppmmode) {
      return value / 3;
    }
    return value;
  };

  count = (string, char) => {
    return (string.length - string.replace(new RegExp(char,"g"), '').length) / char.length;
  };
}

export default memo(MapChart);
