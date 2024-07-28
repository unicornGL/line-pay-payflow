const express = require("express")
const axios = require("axios")
const { v4: uuid } = require("uuid")
const { HmacSHA256 } = require("crypto-js")
const Base64 = require("crypto-js/enc-base64")
require("dotenv").config()

const dummyData = require("../dummy/dummyData")

const router = express.Router()

const {
  VERSION,
  DEV_SITE,
  CHANNEL_ID,
  CHANNEL_SECRET_KEY,
  HOST,
  CONFIRM_PATH,
  CANCEL_PATH,
} = process.env

const orders = {}

router
  .get("/", (req, res) => {
    res.render("index", { title: "Line Pay Practice" })
  })
  .get("/checkout/:id", (req, res) => {
    const { id } = req.params
    const order = dummyData[id]
    order.orderId = uuid()
    orders[order.orderId] = order
    res.render("checkout", { title: "Checkout", ...order })
  })
  .post("/createOrder/:orderId", async (req, res) => {
    const { orderId } = req.params
    const order = orders[orderId]

    try {
      const linePayReqBody = {
        ...order,
        redirectUrls: {
          confirmUrl: HOST + CONFIRM_PATH,
          cancelUrl: HOST + CANCEL_PATH,
        },
      }

      const uri = "/payments/request"
      const headers = createHeaders(uri, linePayReqBody)
      const url = createUrl(uri)

      const linePayRes = await axios.post(url, linePayReqBody, { headers })

      if (linePayRes?.data.returnCode === "0000") {
        res.redirect(linePayRes?.data?.info.paymentUrl.web)
      }
    } catch (error) {
      console.error("createOrder" + error)
      res.end()
    }
  })
  .get(CONFIRM_PATH, async (req, res) => {
    try {
      const { transactionId, orderId } = req.query
      const { amount, currency } = orders[orderId]

      const linePayReqBody = { amount, currency }

      const uri = `/payments/${transactionId}/confirm`
      const headers = createHeaders(uri, linePayReqBody)
      const url = createUrl(uri)

      const linePayRes = await axios.post(url, linePayReqBody, { headers })

      if (linePayRes?.data.returnCode === "0000") {
        res.render("confirm")
      }

      res.end()
    } catch (error) {
      console.error("confirm" + error)
      res.end()
    }
  })

const createHeaders = (uri, reqBody) => {
  const nonce = uuid()
  const signature = Base64.stringify(
    HmacSHA256(
      CHANNEL_SECRET_KEY +
        "/" +
        VERSION +
        uri +
        JSON.stringify(reqBody) +
        nonce,
      CHANNEL_SECRET_KEY
    )
  )

  const headers = {
    "Content-Type": "application/json",
    "X-LINE-ChannelId": CHANNEL_ID,
    "X-LINE-Authorization-Nonce": nonce,
    "X-LINE-Authorization": signature,
  }

  return headers
}

const createUrl = (uri) => DEV_SITE + VERSION + uri

module.exports = router
