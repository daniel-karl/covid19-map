import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-slider/dist/css/bootstrap-slider.css"
import App from './App';
import RApp from './RApp';

if(document.referrer.indexOf("worldhealthstats.online") !== -1) {
    ReactDOM.render(<RApp />, document.getElementById('root'));
}
else if (document.referrer.indexOf("globe.pthapp.co.in") !== -1) {
    ReactDOM.render(<RApp />, document.getElementById('root'));
}
else {
    ReactDOM.render(<App />, document.getElementById('root'));
}




