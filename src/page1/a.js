console.log('222122112');

const div = document.createElement('div')
div.innerText = 'z222s'
document.body.appendChild(div)
console.log(div);

const func = () => {
  return new Promise((resolve) => {
    resolve(1)
  })
}
div.onclick = async () => {
  // require('./d.js')
  await func()
}
const a = 222
export default a