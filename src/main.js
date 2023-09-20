import '@/js/index.js'
import '@/style/css-test.css'
import '@/js/input.js'

const button = document.createElement('button')
button.textContent = 'click me'
button.addEventListener('click', () => {
  const div = document.createElement('div')
  div.className = 'square'
  document.body.append(div)
})
document.body.append(button)

if (module.hot) {
  module.hot.accept('./js/input.js')
}
