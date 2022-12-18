const router = require('express').Router();

const OrderModel = require('../models/order');
const OrderStatus = require('../constants/order-status');
const Passport = require('../modules/passport');

const moment = require('moment')

router.get('/', Passport.requireAuth, async (req, res) => {
  res.redirect('/admin/order/danh-sach.html');
});

router.get('/danh-sach.html', Passport.requireAuth, async (req, res) => {
  const model = {};
  
  model.data = await OrderModel.find(
    {
      isDeleted: false
    }
  ).lean();
  
  res.render('admin/order/list', {
    model,
    moment,
  });
});

router.get('/chi-tiet/:id.html', Passport.requireAuth, async (req, res) => {
  const model = {};
  
  model.order = await OrderModel.findOne(
    {
      id: req.params.id,
      isDeleted: false
    }
  ).lean();
  
  res.render('admin/order/detail', model);
});

router.get('/thanh-toan/:id', Passport.requireAuth, async (req, res) => {
  const docOrder = await OrderModel.findOne(
    {
      id: req.params.id,
      isDeleted: false,
      status: OrderStatus.submit
    }
  ).lean();

// chuyển đổi trạng thái thanh toán
  if (!docOrder || !docOrder.id) {
    req.flash('response_message', 'Invalid Input Parameter');
  }
  else {
    await OrderModel.updateOne(
      {
        id: docOrder.id
      },
      {
        status: OrderStatus.paid
      }
    );
    
    req.flash('response_message', 'Update successful');
  }

  res.redirect(`/admin/order/chi-tiet/${req.params.id}.html`);
});

router.get('/xoa/:id', Passport.requireAuth, async (req, res) => {
  const docOrder = await OrderModel.findOne(
    {
      id: req.params.id,
      // isDeleted: false
      
    },
    {
      id: 1
    }
  ).lean();

  let sMessage = undefined;

  if (!docOrder || !docOrder.id) {
    sMessage = 'Invalid Input Parameter';
  }
  else {
    const updated = await OrderModel.updateOne(
      {
        id: docOrder.id
      },
      {
        $set: {
          isDeleted: true
        }
      }
    );
    
    if (!updated || !isObject(updated) || updated.nModified !== 1) {
      sMessage = 'An error occurred';
    }
    else {
      sMessage = 'Deleted Successfully';
    }
  }
   
  req.flash('response_message', sMessage);

  res.redirect('/admin/order/danh-sach.html');




  //tim oder theo so dien thoai
  const sodienthoai = '0912345678';

  const aOrder = await OrderModel.find(
    {
      isDeleted: false,
      phone: sodienthoai
    }
  ).lean();

  router.get('/search.html', async (req, res) => {
    
  });
});
module.exports = router;
