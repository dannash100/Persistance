const db = require('./db/game')
const {currentGame} = require('./currentGame')


//assign Roles Functions
function assignRoles(roles){
  const spyNum = howManySpies(roles.length)  
  for (let i = 0; i < spyNum; i++){
    assignRandomSpy(roles)
  }
  roles.forEach(role => {
  if (!role.role) role.role = 'good'  
  })  
}

function howManySpies(num){  
  switch(num){
    case 5:
    case 6:
      return 2
    case 7:
    case 8:
    case 9:
      return 3    
    case 10:
      return 4
    default:
      return 0
  }
}

function assignRandomSpy(roles){
  let idx = Math.floor(Math.random()*roles.length)  
  if (roles[idx].role == 'spy') assignRandomSpy(roles)
  else roles[idx].role = 'spy'
}

//new Mission functions
function initMission(game_id){
  db.newMission(game_id).then(ids => {
    db.getMissions(game_id).then(missions => {
      let mission = missions[missions.length - 1] 
      mission.rounds = []
      mission.intentions = []
      currentGame.missions.push(mission)
      currentGame.currentMission = {id: ids[0], mission_num: missions.length, approved: false}
      initRound(game_id)
    })        
  }) 
}

//new Round functions
function initRound(game_id){
  db.getMissions(game_id).then(missions => {    
    const mission_id = missions[missions.length-1].id    
    db.getAllRounds(game_id).then(allRounds => {
      const rounds = allRounds.filter(round => round.mission_id == mission_id)
      const round_num = rounds.length > 0 ? rounds[rounds.length-1].round_num+1 : 1      
      db.getRoles(game_id).then(roles => {        
        let lastLeader = roles.findIndex(role => ((allRounds.length > 0 ? allRounds[allRounds.length-1].leader_id : 0) == role.user_id))        
        const nextLeader = (lastLeader+1 > roles.length-1) ? 0 : lastLeader+1                
        const leader_id = (roles[nextLeader].user_id) || roles[0].user_id
        db.newRound(mission_id, leader_id, round_num).then(ids => {          
          db.getRound(ids[0]).then(round => {
            currentGame.currentRound = round
            currentGame.gameStage = "nominating"
            console.log('nominate the team!!')
            currentGame.missions[missions.length - 1].rounds.push({...round, nominations: [], votes: []})
          })
        })
      })      
    })
  })
}

function checkNominations(round_id) {
  const missionParams = currentGame.missionParams[currentGame.currentMission.mission_num - 1]
  db.getNominations(round_id).then(nominations => {
    if (nominations.length === missionParams.team_total) {
      currentGame.gameStage = "voting"
      console.log('vote on this team!!')
    }
  })
}

//check votes functions
function checkVotes(round_id){
  const round_num = currentGame.currentRound.round_num
  const mission_num = currentGame.currentMission.mission_num
  db.getVotes(round_id).then(votes => {
    currentGame.missions[mission_num-1].rounds[round_num-1].votes = votes
    if (votes.length == currentGame.players.length) {
      if (countVotes(votes)) {
        approveMission(currentGame.currentMission.id)
      }
      else {
        if (currentGame.currentRound.round_num < 5) {
          initRound(currentGame.game.id)
          console.log('rejected')
        }
        else missionFails()
      }
    }
  })
}

function countVotes(votes){
  const approve = votes.reduce((acc, vote) => {
    if (vote.vote) acc++
    return acc
  }, 0)
  const reject = votes.length - approve
  return (approve > reject)
}

// mission functions
function approveMission(){
  currentGame.currentMission.approved = true
  currentGame.gameStage = "intentions"
  console.log('mission goes ahead')
  console.log('place your intentions!!')
}

function checkIntentions(mission_id){
  const mission_num = currentGame.currentMission.mission_num
  const {team_total, fails_needed} = currentGame.missionParams[mission_num-1]  
  db.getIntentions(mission_id).then(intentions => {
    currentGame.missions[mission_num-1].intentions = intentions
    if (intentions.length == team_total){
      if (countIntentions(intentions, fails_needed)) missionSucceeds(mission_id)
      else missionFails(mission_id)
    }
  })
}

function countIntentions(intentions, fails_needed){
  const fails = intentions.reduce((acc, intention) => {
    if (!intention.intention) acc++
    return acc
  }, 0)
  return (fails < fails_needed)
}

function missionSucceeds(mission_id){
  const mission_num = currentGame.currentMission.mission_num
  currentGame.missions[mission_num-1].outcome = true
  db.finishMission(mission_id, true).then(() => {
    isGameFinished(currentGame.game.id)
    console.log('SUCCESS')
  })  
}

function missionFails(mission_id){
  const mission_num = currentGame.currentMission.mission_num
  currentGame.missions[mission_num-1].outcome = false
  db.finishMission(mission_id, false).then(() => {
    isGameFinished(currentGame.game.id)    
    console.log("FAILURE")
  })  
}

function isGameFinished(game_id){  
  db.getMissions(game_id).then(missions => {
    const successes = missions.reduce((acc, mission) => {
      if (mission.outcome) acc++
      return acc
    }, 0)
    const fails = missions.length - successes
    if (successes == 3) goodiesWin()
    else if (fails == 3) spiesWin()
    else initMission(game_id)
  })  
}

function goodiesWin(){
  console.log('Goodies Win')
}

function spiesWin(){
  console.log('Spies Win')
}

module.exports = {
  assignRoles,
  initMission,
  initRound,
  checkVotes,
  checkIntentions,
  checkNominations
}