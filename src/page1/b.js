import image from '../images/img1.png'
console.log('2331w11221233');
const a = 1232
const txt = `${a}----222222`
console.log(txt);

const obj = {
  a: 1,
  b: 2
}
// 我是注释999999
console.log(Object.keys(obj))

const img = document.createElement('img')
// require引入图片
// img.src = require('../images/img.png').default
img.src = require('../images/svg1.svg').default
document.body.append(img)

const img1 = document.createElement('img')
// import 引入图片
img1.src = image
document.body.append(img1)

const dom = document.getElementsByTagName('div')
console.log(Array.from(dom));