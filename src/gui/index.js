import Vue from 'vue'
import Gui from './select-img'

export function initGui () {
  addButton()
}

function addButton () {
  let button = document.createElement('div')
  document.body.appendChild(button)
  /* eslint-disable no-new */
  new Vue({
    el: button,
    render: h => h(Gui)
  })
}
