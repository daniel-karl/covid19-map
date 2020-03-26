import React, {useState} from 'react';
import MapChart from "./MapChart";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDotCircle} from '@fortawesome/free-regular-svg-icons';
import { faBiohazard, faHeartBroken, faHeartbeat} from '@fortawesome/free-solid-svg-icons';

import Utils from "./Utils";

function App() {
  const [totConf, setTotConf] = useState(0);
  const [totRec, setTotRec] = useState(0);
  const [totDead, setTotDead] = useState(0);

  return (
    [
      <Navbar bg="light" fixed="top" className={"p-0 pl-2"} expand={"xs"}>
        <Navbar.Brand>
            <span className={"open"}>OPEN SOURCE</span>
            <span className="small">C<FontAwesomeIcon icon={faDotCircle} />VID19 </span>
            <span className={"project"}>MAP.IO</span>
        </Navbar.Brand>
          <span>
            <span className={"small text-danger mr-2"}>
                <FontAwesomeIcon icon={faBiohazard} className={"mr-1"} />
                {Utils.rounded(totConf)}
            </span>
            {
              totRec > 0 &&
              <span className={"small text-success mr-2"}>
                  <FontAwesomeIcon icon={faHeartbeat} className={"mr-1"} />
                  {Utils.rounded(totRec)}
              </span>
            }
            <span className={"small mr-2"}>
                <FontAwesomeIcon icon={faHeartBroken} className={"mr-1"} />
                {Utils.rounded(totDead)}
            </span>
          </span>
      </Navbar>,
      <Container fluid className={"w-100 h-100 p-0"}>
        <Row noGutters={"true"} className={"h-100"}>
          <Col className={"h-100"}>
            <MapChart
                key={"mapChart"}
                style={{marginTop: "50px"}}
                setTotConf={setTotConf}
                setTotRec={setTotRec}
                setTotDead={setTotDead}
            />
          </Col>
        </Row>
      </Container>
    ]
  );
}

export default App;
