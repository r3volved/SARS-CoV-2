#Simple Canada Cases Class

```js
const Covid = require('./covid.js')
const covid = new Covid()
const init = async () => {

    await covid.update()

    await covid.canada().then(console.log)

    await covid.province('Manitoba').then(console.log)

}
init()
```
