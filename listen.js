const { app } = require("./app");

const listeningPort = 8080

app.listen(listeningPort, () => {
    console.log(`Server is listening on port ${listeningPort}`)
})