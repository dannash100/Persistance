import React from 'react'
import { connect } from 'react-redux'

import ChoiceButtons from './ChoiceButtons'
import IntentionButtons from './IntentionButtons'
import ConfirmNom from './ConfirmNom'

const Buttons = props => {
  const authId = props.auth.user.id
  const isLeader = (props.currentGame.currentRound.leader_id == authId) //1 needs to be auth id //can be removed?
  const { gameStage } = props.currentGame
  const { round_num } = props.currentGame.currentRound
  const { mission_num } = props.currentGame.currentMission

  const noms = props.currentGame.missions[mission_num - 1].rounds[round_num - 1].nominations
  const reqNoms = props.missionParams[mission_num -1].team_total
  const allNoms = reqNoms == noms.length 

  const onTeam = noms.reduce((acc, nom) => {
    if (nom.user_id == authId) return true  //1 needs to be auth id
    else return acc
  }, false)

  return (
    <div>
      {(gameStage == 'voting') && <ChoiceButtons />}
      {(onTeam && gameStage == 'intentions') && <IntentionButtons />}
      {(gameStage == 'nominating' && isLeader && allNoms) && <ConfirmNom />}
    </div>
  )
}

const mapStateToProps = (state) => state


export default connect(mapStateToProps)(Buttons)
// 1532392238361,1532392168851 //The integer error is from the timestamp


