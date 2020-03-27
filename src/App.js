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
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [totalRecovered, setTotalRecovered] = useState(0);
  const [totalDeceased, setTotalDeceased] = useState(0);
  const [totalConfirmedProjected, setTotalConfirmedProjected] = useState(0);

  return (
    [
      <Navbar bg="light" fixed="top" className={"p-0 pl-2"} expand={"xs"}>
        <Navbar.Brand>
            <span className="small">C<FontAwesomeIcon icon={faDotCircle} />VID19 </span>
            <span className={"mapio"}><b>MAP</b><span className="text-secondary">.IO</span></span>
        </Navbar.Brand>
          <span>
            {
              totalConfirmedProjected > totalConfirmed &&
              <span className={"small text-primary mr-2"}>
                <FontAwesomeIcon icon={faBiohazard} className={"mr-1"}/>
                {Utils.rounded(totalConfirmedProjected)}
              </span>
            }
            {
              totalConfirmedProjected <= totalConfirmed &&
              <span className={"small text-danger mr-2"}>
                <FontAwesomeIcon icon={faBiohazard} className={"mr-1"}/>
                {Utils.rounded(totalConfirmed)}
              </span>
            }
            <span className={"small text-success mr-2"}>
              <FontAwesomeIcon icon={faHeartbeat} className={"mr-1"} />
              {Utils.rounded(totalRecovered)}
            </span>
            <span className={"small mr-2"}>
              <FontAwesomeIcon icon={faHeartBroken} className={"mr-1"} />
              {Utils.rounded(totalDeceased)}
            </span>
          </span>
      </Navbar>,
      <Container fluid className={"w-100 h-100 p-0"}>
        <Row noGutters={"true"} className={"h-100"}>
          <Col className={"h-100"}>
            <MapChart
                key={"mapChart"}
                style={{marginTop: "50px"}}
                setTotalConfirmed={setTotalConfirmed}
                setTotalRecovered={setTotalRecovered}
                setTotalDeceased={setTotalDeceased}
                setTotalConfirmedProjected={setTotalConfirmedProjected}
            />
          </Col>
        </Row>
      </Container>
    ]
  );
}

export default App;
