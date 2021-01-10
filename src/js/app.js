import $$ from 'dom7'
import Framework7 from 'framework7/framework7.esm.bundle.js'
import 'framework7/css/framework7.bundle.css'
import '../css/icons.css'
import '../css/app.css'
import routes from './routes.js'
import Game from './game'

new Framework7({ // eslint-disable-line no-unused-vars
  root: '#app', // App root element
  name: 'BDI Game', // App name
  theme: 'auto', // Automatic theme detection
  data: () => {
    $$(document).on('page:init', e => {
      let game = Game()
      let shouldRestart = false
      $$('.restart-button').on('click', () => {
        shouldRestart = true
      })
      window.setInterval(() => {
        if (shouldRestart) {
          shouldRestart = false
          game = Game()
        } else {
          game.run(1)
          $$('#arena-grid').html(game.render(game.state))
          $$('#analysis').html(`
            <table>
              <tr>
                <td><strong>Agent</strong></td>
                ${game.state.positions.map((_, index) => `<td>${index}</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Health</strong></td>
                ${game.state.health.map(healthScore => `<td>${healthScore}</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Clues (points)</strong></td>
                ${game.state.clue.map(clue => `<td>${clue}</td>`).join('')}
              </tr>
            </table>
          `)
        }
      }, 500)
    })
  },
  routes: routes
})
