// tag::import-react[]
import React from 'react';
// end::import-react[]
// tag::react-dom[]
import ReactDOM from 'react-dom';
// end::react-dom[]
import './Styles/index.css';
import App from './Components/App';

// tag::dom-render[]
ReactDOM.render(<App />, document.getElementById('root'));
// end::dom-render[]
