console.log('dddd');
const a = new Promise((resolve) => {
  setTimeout(() => {
    resolve('111111')
  }, 3000)
})
console.log(a);