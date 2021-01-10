import { Belief, Desire, Plan, Agent, GridWorld, FieldType } from 'js-son-agent'

/* desires */
const desires = {
  ...Desire('go', beliefs => {
    if (Math.random() < 0.30) { // random exploration
      return Object.keys(beliefs.neighborStates)[Math.floor(Math.random() * 4)]
    }
    const neighborsClues = Object.keys(beliefs.neighborStates).some(
      key => beliefs.neighborStates[key] === 'clues'
    )
    const neighborsRepair = Object.keys(beliefs.neighborStates).some(
      key => beliefs.neighborStates[key] === 'repair'
    )
    const neighborsPlain = Object.keys(beliefs.neighborStates).some(
      key => beliefs.neighborStates[key] === 'plain'
    )
    if (neighborsClues) {
      return Object.keys(beliefs.neighborStates).find(
        key => beliefs.neighborStates[key] === 'clues'
      )
    } else if (neighborsRepair) {
      return Object.keys(beliefs.neighborStates).find(
        key => beliefs.neighborStates[key] === 'repair'
      )
    } else if (neighborsPlain) {
      return Object.keys(beliefs.neighborStates).find(
        key => beliefs.neighborStates[key] === 'plain'
      )
    } else {
      return undefined
    }
  })
}

const plans = [
  Plan(
    desires => desires.go === 'up',
    () => ({ go: 'up' })
  ),
  Plan(
    desires => desires.go === 'down',
    () => ({ go: 'down' })
  ),
  Plan(
    desires => desires.go === 'left',
    () => ({ go: 'left' })
  ),
  Plan(
    desires => desires.go === 'right',
    () => ({ go: 'right' })
  )
]

const determineNeighborStates = (position, state) => ({
  up: position + 10 >= 100 ? undefined : state.fields[position + 10],
  down: position - 10 < 0 ? undefined : state.fields[position - 10],
  left: position % 10 === 0 ? undefined : state.fields[position - 1],
  right: position % 10 === 1 ? undefined : state.fields[position + 1]
})

const generateAgents = initialState => initialState.positions.map((position, index) => {
  const beliefs = {
    ...Belief('neighborStates', determineNeighborStates(position, initialState)),
    ...Belief('position', position),
    ...Belief('health', 10),
    ...Belief('clue', 0)
  }
  return new Agent(
    index,
    beliefs,
    desires,
    plans
  )
})

const generateInitialState = () => {
  const dimensions = [10, 10]
  const positions = []
  const fields = Array(dimensions[0] * dimensions[1]).fill(0).map((_, index) => {
    const rand = Math.random()
    if (rand < 0.05) {
      return 'mountain'
    } else if (rand < 0.08) {
      return 'clues'
    } else if (rand < 0.1) {
      return 'repair'
    } else if (rand < 0.5 && positions.length < 5) {
      positions.push(index)
      return 'plain'
    } else {
      return 'plain'
    }
  })
  return {
    dimensions,
    positions,
    clue: Array(positions.length).fill(0),
    health: Array(positions.length).fill(10),
    fields
  }
}

const generateConsequence = (state, agentId, newPosition) => {
  switch (state.fields[newPosition]) {
    case 'plain':
      if (state.positions.includes(newPosition)) {
        state.health = state.health.map((healthScore, index) => {
          if (state.positions[index] === newPosition) {
            if (state.health[index] <= 1) {
              state.positions[index] = undefined
            }

            // Lucky clue on enemy
            let rand = Math.random()
            if (rand < 0.25) {
              state.clue[agentId]++
            }

            // Lucky move
            rand = Math.random()
            if (rand < 0.03) {
              return healthScore + 1
            }

            rand = Math.floor(Math.random() * 3)
            return healthScore - rand
          } else {
            return healthScore
          }
        })
        state.health[agentId]--
        if (state.health[agentId] <= 0) {
          state.positions[agentId] = undefined
        }
      } else {
        state.positions[agentId] = newPosition
      }
      break
    case 'clues':
      state.clue[agentId]++
      break
    case 'repair':
      if (state.health[agentId] < 10) state.health[agentId]++
      break
  }
  return state
}

const trigger = (actions, agentId, state, position) => {
  console.log(actions[0].go, agentId)
  switch (actions[0].go) {
    case 'up':
      if (position && position + 10 < 100) {
        state = generateConsequence(state, agentId, position + 10)
      }
      break
    case 'down':
      if (position && position - 10 >= 0) {
        state = generateConsequence(state, agentId, position - 10)
      }
      break
    case 'left':
      if (position && position % 10 !== 0) {
        state = generateConsequence(state, agentId, position - 1)
      }
      break
    case 'right':
      if (position && position % 10 !== 1) {
        state = generateConsequence(state, agentId, position + 1)
      }
      break
  }
  return state
}

const stateFilter = (state, agentId, agentBeliefs) => ({
  ...agentBeliefs,
  clue: state.clue[agentId],
  health: state.health[agentId],
  neighborStates: determineNeighborStates(state.positions[agentId], state)
})

const fieldTypes = {
  mountain: FieldType(
    'mountain',
    () => 'mountain-field material-icons mountain',
    () => '^',
    trigger
  ),
  clues: FieldType(
    'clues',
    () => 'clues-field material-icons clue',
    () => 'v',
    trigger
  ),
  repair: FieldType(
    'repair',
    () => 'repair-field material-icons build',
    () => 'F',
    trigger
  ),
  plain: FieldType(
    'plain',
    (state, position) => state.positions.includes(position)
      ? 'plain-field material-icons guy'
      : 'plain-field',
    (state, position) => state.positions.includes(position)
      ? 'R'
      : '-',
    trigger,
    (state, position) => state.positions.includes(position)
      ? `<div class="field-annotation">${state.positions.indexOf(position)}</div>`
      : ''
  )
}

const Game = () => {
  const initialState = generateInitialState()
  return new GridWorld(
    generateAgents(initialState),
    initialState,
    fieldTypes,
    stateFilter
  )
}

export default Game
