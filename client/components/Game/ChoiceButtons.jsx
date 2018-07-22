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
    if (this.state.hasVoted) return
    //do somthing
    const user = {id: this.props.auth.user.id} //needs to be from auth
    const vote = {user, game: this.props.currentGame.game, vote: (e.currentTarget.value == 'true')}
    
    sendVote(vote)
    this.setState({hasVoted: true})

}
render() {
  const {hasVoted} = this.state.hasVoted
    return (
    <div>
     <button disabled={hasVoted} onClick={(e) => this.handleClick(e)} value="true" style={{marginBottom: '0.5vw'}} className="button is-success is-large is-outlined"><i className="fas fa-check"></i></button>
     <button disabled={hasVoted} onClick={(e) => this.handleClick(e)} value="false" style={{marginBottom: '0.5vw'}} className="button is-danger is-large is-outlined"><i className="fas fa-times"></i></button>
     </div>
    )
  }
}

const mapStateToProps = (state) => state

export default connect(mapStateToProps)(ChoiceButton)
