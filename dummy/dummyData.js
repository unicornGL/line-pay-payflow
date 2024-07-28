// spec: https://pay.line.me/tw/developers/apis/onlineApis -> Payment APIs -> Request API

const orders = {
  1: {
    amount: 1200,
    currency: "TWD",
    packages: [
      {
        id: "order_1",
        amount: 1200,
        products: [
          {
            name: "Hello",
            quantity: 1,
            price: 1000,
          },
          {
            name: "World",
            quantity: 2,
            price: 100,
          },
        ],
      },
    ],
  },
}

module.exports = orders
