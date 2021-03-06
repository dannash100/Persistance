const db = require('../db/game')
const {assignRoles, initMission, checkVotes, checkIntentions, checkNominations} = require('../gameFunctions')
var router = require('express').Router()


const {currentGame, initalGame} = require('../currentGame')


router.post('/new', (req, res) => {
  const {game_name, user} = req.body
  Object.assign(currentGame, initalGame)
  currentGame.missions = []
  db.createGame(game_name, user.id).then(ids => {    
    db.getGame(ids[0]).then(game => {
      console.log('new game')
      currentGame.game = game
      res.json(game)
    })
  })
})

router.post('/join', (req, res) => {

  if (currentGame.gameStage !== 'waiting') return res.sendStatus(400)
  if (currentGame.players.length >= 10) return res.sendStatus(400)
  const game_id = req.body.game.id
  const user_id = req.body.user.id
  db.getPlayers(game_id).then(playersList => {        
    if (playersList.find(x => x.id == user_id)) return res.sendStatus(400)
    db.roleEntry(game_id, user_id).then(() => {
      db.getPlayers(game_id).then(playersList => {
        currentGame.players = playersList
        const {game, players, gameStage, missions, currentRound, currentMission, missionParams} = currentGame
        const gameData = {currentGame: {game, players, gameStage, missions, currentRound, currentMission}, missionParams}
        res.json(gameData)
      })
  
    })
  })
  
})

router.post('/start', (req, res) => {
  if (currentGame.gameStage !== 'waiting') return res.sendStatus(400)
  if (currentGame.players.length < 2) return res.sendStatus(400)   // change back to five
  const game_id = req.body.game.id
  db.getRoles(game_id).then(roles => {
    assignRoles(roles)
    db.delRoles(game_id).then(() => {
      db.setRoles(roles).then(() => {
        db.startGame(game_id).then(() => {
          currentGame.game.in_progress = true
          db.getPlayers(game_id).then(playersList => {
            currentGame.players = playersList
            db.getMissionParams(playersList.length).then(missionParams => {
              currentGame.missionParams = missionParams
              initMission(game_id).then(() => {
                console.log('game started')
                const {game, players, gameStage, missions, currentRound, currentMission, missionParams} = currentGame
                const gameData = {currentGame: {game, players, gameStage, missions, currentRound, currentMission}, missionParams}
                res.json(gameData)
              })
            })
          })
        })
      })
    })
  })
})


router.post('/nominate', (req, res) => {
  if (currentGame.gameStage !== 'nominating') return res.sendStatus(400)
  const game_id = req.body.game.id
  const user_id = req.body.nomination.user.id
  const round_id = currentGame.currentRound.id
  const round_num = currentGame.currentRound.round_num
  const mission_num = currentGame.currentMission.mission_num
  db.castNomination(round_id, user_id).then(() => {
    db.getNominations(round_id).then(nominations => {
      console.log('nomination recieved')
        currentGame.missions[mission_num-1].rounds[round_num-1].nominations = nominations
        const {game, players, gameStage, missions, currentRound, currentMission, missionParams} = currentGame
        const gameData = {currentGame: {game, players, gameStage, missions, currentRound, currentMission}, missionParams}
        res.json(gameData)
    })
  })
})

router.post('/remove', (req, res) => {
  if (currentGame.gameStage !== 'nominating') return res.sendStatus(400)
  const game_id = req.body.game.id
  const user_id = req.body.nomination.user.id
  const round_id = currentGame.currentRound.id
  const round_num = currentGame.currentRound.round_num
  const mission_num = currentGame.currentMission.mission_num  
  db.removeNomination(round_id, user_id).then(() => {
    db.getNominations(round_id).then(nominations => {
      console.log('nomination removed')
        currentGame.missions[mission_num-1].rounds[round_num-1].nominations = nominations
        const {game, players, gameStage, missions, currentRound, currentMission, missionParams} = currentGame
        const gameData = {currentGame: {game, players, gameStage, missions, currentRound, currentMission}, missionParams}
        res.json(gameData)
    })
  })   
})

router.post('/confirmNoms', (req, res) => {
  if (currentGame.gameStage !== 'nominating') return res.sendStatus(400)
  const game_id = req.body.game.id
  const round_id = currentGame.currentRound.id
  checkNominations(round_id).then(() => {
    const {game, players, gameStage, missions, currentRound, currentMission, missionParams} = currentGame
    const gameData = {currentGame: {game, players, gameStage, missions, currentRound, currentMission}, missionParams}
    res.json(gameData)
  })
})

router.post('/vote', (req, res) => {
  if (currentGame.gameStage !== 'voting') return res.sendStatus(400)
  const game_id = req.body.game.id
  const user_id = req.body.user.id
  const vote = req.body.vote
  const round_id = currentGame.currentRound.id
  db.castVote(round_id, user_id, vote).then(() => {
    console.log('vote recieved')
    checkVotes(round_id).then(() => {
      const {game, players, gameStage, missions, currentRound, currentMission, missionParams} = currentGame
      const gameData = {currentGame: {game, players, gameStage, missions, currentRound, currentMission}, missionParams}
      res.json(gameData)
    })

  })
})

router.post('/intention', (req, res) => {
  if (currentGame.gameStage !== 'intentions') return res.sendStatus(400)
  const game_id = req.body.game.id
  const user_id = req.body.user.id
  const intention = req.body.intention
  const mission_id = currentGame.currentMission.id
  db.castIntention(mission_id, user_id, intention).then(() => {
    console.log('intention recieved')
    checkIntentions(mission_id).then(() => {
      const {game, players, gameStage, missions, currentRound, currentMission, missionParams} = currentGame
      const gameData = {currentGame: {game, players, gameStage, missions, currentRound, currentMission}, missionParams}
      res.json(gameData)
    })

  })
})

module.exports = router
