import React, { Component } from "react";
import Poll from 'react-polls';

const pollQuestion = 'Do you agree with the call?'
const pollAnswers = [
  { option: 'Yes', votes: 0 },
  { option: 'No', votes: 0 },
  { option: 'Uncertain', votes: 0 },
]
const pollStyle = {
  questionSeparator: false,
  questionSeparatorWidth: 'question',
  questionBold: true ,
  questionColor: '#FFFFFF',
  align: 'center',
  theme: 'cyan'
}

export default class Poller extends Component {

  // Setting answers to state to reload the component with each vote

  constructor(props) {
    super(props);
    this.state = {
        videoId: this.props.videoId,
        pollAnswers: [...pollAnswers]
    };
    console.log(this.state)
  }

  // Handling user vote
  // Increments the votes count of answer when the user votes
  handleVote = (voteAnswer, pollAnswers) => {
    const newPollAnswers = pollAnswers.map(answer => {
      if (answer.option === voteAnswer) answer.votes++
      return answer
    })
    this.setState({
      pollAnswers: newPollAnswers
    })
  }

  componentDidMount() {
  const { pollAnswers } = this.state
  this.autoAddVotes(pollAnswers)
  }

  autoAddVotes = (pollAnswers) => {
    setTimeout(() => {
      const choseAnswer = parseInt(Math.random() * 3, 10)
      this.handleVote(pollAnswers[choseAnswer].option, pollAnswers)
      this.autoAddVotes(pollAnswers)
    }, Math.random() * 5000)
  }

  render () {
    const { pollAnswers } = this.state

    return (
        <div className='app'>
            <main className='main'>
                <div>
                    <Poll question={pollQuestion} answers={pollAnswers} onVote={voteAnswer => this.handleVote(voteAnswer, pollAnswers)} customStyles={pollStyle} />
                </div>
            </main>
        </div>
    );
  }
}
