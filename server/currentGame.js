const currentGame = {
  game: {},
  players: [],
  currentMission: {},
  currentRound: {},
  gameStage: "",
  missionParams: [],
  missions: []
}

const initalGame = {
  game: {},
  players: [],
  currentMission: {},
  currentRound: {},
  gameStage: "waiting",
  missionParams: [],
  missions: []
}

module.exports = {currentGame, initalGame}