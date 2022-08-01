const express = require('express')
const parseUrl = require('body-parser')
const axios = require('axios').default;

const app = express()

const WIPAY_SERVER_URL = "https://uat-api.wipay.dev";
const SECRET_ID = "$SECRET_ID";
const SECRET_KEY = "$SECRET_KEY";

let encodeUrl = parseUrl.urlencoded({extended: false})

const config = {
    auth: {
        username: SECRET_ID,
        password: SECRET_KEY
    }
};

app.get('/', (_req, res) => {
    res.sendFile(__dirname + '/src/web/index.html')
})

app.post('/checkout', encodeUrl, (req, res) => {
    const data = {
        customerId: "your_customer_id",
        orderRef: Date.now(), // Fill your uniquely order id
        amount: 12345,
        currency: "THB",
        returnUri: "http://localhost:4000/completed"
    }
    if (req.body.token) {
        data.token = req.body.token;
    } else if (req.body.source) {
        data.sourceId = req.body.source;
    } else {
        res.sendStatus(400);
    }
    axios.post(
        WIPAY_SERVER_URL + "/v1/charges",
        data,
        config
    ).then(value => {
        if (value.data.authorizeUri) {
            res.redirect(value.data.authorizeUri)
        } else {
            console.log("Charged!!!")
        }
    }).catch(reason => {
        console.log("Error: ", reason)
    })
})

app.get('/completed', (req, res) => {
    res.send({
        chargeId: req.query.chargeId,
        orderRef: req.query.orderRef,
        status: req.query.status,
    });
})

app.use(express.static(__dirname));

app.listen(process.env.PORT, () =>
    console.log(`Listening on port ${process.env.PORT}!`),
);
