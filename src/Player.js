// import react

import React, { Component } from 'react';

// import header and footer

import Header from './Header';
import Footer from './Footer';
import Poll from 'react-polls';

import { Amplify, Auth, API } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const pollQuestion = 'Do you agree with the call?'
var pollAnswers = [
  { option: 'Yes', votes: 0 },
  { option: 'No', votes: 0 },
]
const pollStyle = {
  questionSeparator: false,
  questionSeparatorWidth: 'question',
  questionBold: true ,
  questionColor: '#FFFFFF',
  align: 'center',
  theme: 'cyan'
}

// get video id

export default class Player extends Component {
  state = {
    pollAnswers: [...pollAnswers]
  }

  constructor(props) {
    super(props);
    this.state = {
        videoId: this.props.match.params.guid,
        videoData: {}
    };
  }

  async componentDidMount() {
    const userData = await Auth.currentUserInfo();
    this.setState({ userdata : userData });
    console.log(this.state.userdata.attributes.email);
      const apiResponse = await API.get('videoapi', `/videos/object`, {
        'queryStringParameters': {
          guid: `${this.state.videoId}`
        }
      });
      this.setState({ videoData: apiResponse });
      const rawUrl = `${this.state.videoData.mp4Urls[0]}`;
      const convUrl = rawUrl.replace(/#/g, "%23");
      this.setState({ mp4Url: convUrl });
      const srcVidTitle = `${this.state.videoData.srcVideo}`;
      const formattedVidTitle = srcVidTitle.replace(/_/g," ").slice(0, -4);
      this.setState({ videoTitle: formattedVidTitle });

      //initialize dynamodb data
      const dbPollAnswers = [
          { option: 'Yes', votes: `${this.state.videoData.yesVotes}` },
          { option: 'No', votes: `${this.state.videoData.noVotes}` }
      ]
      this.setState({
        pollAnswers: dbPollAnswers
      })
  }
    // handles votes

  async handleVote(voteAnswer, pollAnswers) {
    //update dynamo data
    var voteType = ''
    var voterType = ''
    if (voteAnswer === 'Yes') {
      voteType = 'yesVotes'
      voterType = 'yesVoters'
    }
    if (voteAnswer === 'No') {
      voteType = 'noVotes'
      voterType = 'noVoters'
    }
    const init = {
      queryStringParameters: {
        guid: `${this.state.videoId}`,
        vote: `${voteType}`,
        voter: `${voterType}`,
        user: `${this.state.userdata.attributes.email}`
      }
    }
    const apiPost = await API.put('voteapi', `/votes`, init);
    console.log(pollAnswers)
    console.log(this.state.pollAnswers)
    //grab new data from dynamodb
    const voteUpdate = await API.get('videoapi', `/videos/object`, {
      'queryStringParameters': {
        guid: `${this.state.videoId}`
      }
    });
    this.setState({ videoData: voteUpdate });
    const dbPollAnswers = [
        { option: 'Yes', votes: `${this.state.videoData.yesVotes}` },
        { option: 'No', votes: `${this.state.videoData.noVotes}` }
    ]
    this.setState({
      pollAnswers: dbPollAnswers
    })
    console.log(this.state.pollAnswers)
  };

    render() {

      const pollAnswers = [
          { option: 'Yes', votes: this.state.videoData.yesVotes },
          { option: 'No', votes: this.state.videoData.noVotes }
      ]

        return (
            <div className="App">
              <Header />
                <div className="container">
                  <header className="App-header">
                    <video controls muted autoPlay key={this.state.mp4Url}>
                        <source src= {this.state.mp4Url} type="video/mp4"></source>
                    </video>
                    <h1 key={this.state.videoTitle}>{ `${this.state.videoTitle}` }</h1>
                  </header>
                  <header className="App-header">
                    <Poll question={pollQuestion} answers={pollAnswers} onVote={voteAnswer => this.handleVote(voteAnswer, pollAnswers)} customStyles={pollStyle} />
                  </header>
                </div>
              <Footer />
            </div>
        );
    }
}
