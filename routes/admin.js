const router = require('express').Router();

const OrderModel = require('../models/order');
const OrderStatus = require('../constants/order-status');
const Passport = require('../modules/passport');
const ProductModel = require('../models/product');
const UserModel = require('../models/user');

router.get('/', Passport.requireAuth, async (req, res) => {
  const data = {
    order: 0,
    product: 0,
    profit: 0,
    user: 0
  };

  data.order = await OrderModel.find().count();

  data.product = await ProductModel.find().count();

  data.user = await UserModel.find().count();

  const arr = await OrderModel.find(
    {
      status: OrderStatus.paid
    }
  ).lean();

  if (arr && arr.length > 0) {
    for (const x of arr) {
      data.profit += x.total;
    }
  }

  res.render('admin/index', data);
});


router.post('/getUser', Passport.requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
