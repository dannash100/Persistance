import React from 'react'
import { connect } from 'react-redux'
import {sendVote} from '../../actions/playerInputs'

class ChoiceButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        hasVoted: false
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    const user = {id: this.props.auth.user.id} //needs to be from auth
    const vote = {user, game: this.props.currentGame.game, vote: (e.currentTarget.value == 'true')}

    sendVote(vote)
      .then(res => {
        const localSocket = this.props.socket
        const gameData = res.body
        const game_id = vote.game.id

        localSocket.emit('updateGameRoom', gameData, game_id)
        this.setState({hasVoted: true})
      })
  }

  render() {

    return this.state.hasVoted ? (
      <div>
      <button disabled onClick={(e) => this.handleClick(e)} value="true" style={{marginBottom: '0.5vw'}} className="button is-success is-large is-outlined"><i className="fas fa-check"></i></button>
      <button disabled onClick={(e) => this.handleClick(e)} value="false" style={{marginBottom: '0.5vw'}} className="button is-danger is-large is-outlined"><i className="fas fa-times"></i></button>
      </div>
    ) : (
      <div>
      <button onClick={(e) => this.handleClick(e)} value="true" style={{marginBottom: '0.5vw'}} className="button raise-green is-success is-large is-outlined"><i className="fas fa-check"></i></button>
      <button onClick={(e) => this.handleClick(e)} value="false" style={{marginBottom: '0.5vw'}} className="button raise-red is-danger is-large is-outlined"><i className="fas fa-times"></i></button>
      </div>
    )
  }
}

const mapStateToProps = (state) => state

export default connect(mapStateToProps)(ChoiceButton)
