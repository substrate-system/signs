import { effect, sign } from '../src/index.js'
const qs = document.querySelector.bind(document)

const count = sign(0)

qs('#root').innerHTML = `
    <h1 class="count">${count.value}</h1>
    <button>Plus</button>
    <button class="reset">Reset</button>
`

effect(() => {
    qs('h1').innerHTML = count.value
})

qs('button.reset').addEventListener('click', ev => {
    ev.preventDefault()
    count.value = 0
})

const btn = qs('button') as HTMLButtonElement
btn.addEventListener('click', ev => {
    ev.preventDefault()
    count.value++
})
