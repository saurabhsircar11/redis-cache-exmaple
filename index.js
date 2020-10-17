const express = require("express")
const axios = require("axios")
const redis = require("redis")
const bodyParser = require("body-parser")
const cors = require('cors')



const port_redis = process.env.PORT || 6379
const port = process.env.PORT || 3000
const redis_client = redis.createClient(port_redis);


const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())



//middleware to check cache

checkCache = (req, res, next) => {
    const { country } = req.params;
    redis_client.get(country, (err, data) => {
        if (err) {
            console.log(error)
            res.status(500).send(err)
        }
        if (data != null) {
            res.send(data)
        }
        else {
            next()
        }
    })
}


app.get("/countries/:country",checkCache,async (req, res) => {

    try {
        const { country } = req.params;
        const countryInfo = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${country}`)
        const countryInfoData = countryInfo.data;
        redis_client.setex(country, 3600, JSON.stringify(countryInfoData));
        return res.json(countryInfoData)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

app.listen(port, () => console.log(`Server running on Port ${port}`))
