import './App.css';
import React from 'react';

import {
    Route,
    BrowserRouter as Router,
    Switch,
} from "react-router-dom";

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator } from '@aws-amplify/ui-react';


import Home from './Home';
import Player from './Player';

Amplify.configure(awsconfig);

function App() {
    return (
        <Router>
            <Switch>
            <Route exact path="/" component={Home}></Route>
            <Route path="/player/:guid" component={Player}></Route>
            </Switch>
        </Router>
    );
}

export default withAuthenticator(App);
