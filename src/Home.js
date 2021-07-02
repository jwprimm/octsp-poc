// import required packages

import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Amplify, API } from 'aws-amplify';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';

// import header and footer

import Header from './Header';
import Footer from './Footer';

// initiate variable videos

Amplify.configure(awsconfig);

export default class Home extends Component {
  constructor() {
      super();
      this.state = {
        videos: []
      }
  };

  // makes request to endpoint to return array of video metadata

  async componentDidMount() {
    const apiResponse = await API.get('videoapi', '/videos');
    console.log(apiResponse);
    const videoData = JSON.stringify(apiResponse);
    console.log(videoData);
    this.setState({ videos: apiResponse });
    console.log(this.state)
  }

  render(){
      console.log(this.state.videos);
      return (
          <div className="App">
              <Header />
                <div className="container">
                    <div className="row">
                        {this.state.videos.map(video =>
                        <div className="col-md-4" key={video.guid}>
                            <Link to={`/player/${video.guid}`}>
                                <div className="card border-0">
                                    <img src={`${video.thumbNailsUrls}`.replace(/#/g,"%23")} alt="" />
                                      <div className="card-body">
                                          <p>{video.srcVideo.replace(/_/g," ").slice(0, -4)}</p>
                                      </div>
                                </div>
                            </Link>
                        </div>
                        )}
                    </div>
                </div>
                <div className="AmplifySignOut">
                    <AmplifySignOut />
                </div>
              <Footer />
          </div>
      )
  }
}
