const router = require('express').Router();

const multer  = require('multer');

const upload = multer(
  {
    storage:  multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/upload');
      },
      filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
      }
    })
  }
);

const CategoryModel = require('../models/category');
const Charset = require('../modules/charset');
const Passport = require('../modules/passport');
const ProductModel = require('../models/product');

router.get('/', Passport.requireAuth, (req, res) => {
  res.redirect('/admin/product/danh-sach.html');
});

router.get('/danh-sach.html', Passport.requireAuth, async (req, res) => {
  const model = {};
  
  model.data = await ProductModel.find(
    {
      isDeleted: false
    }
  ).lean();
  
  res.render('admin/product/list', model);
});

router.get('/them.html', Passport.requireAuth, async (req, res) => {
  const model = {
    errors: null
  };
  
  model.category = await CategoryModel.find(
    {
      isDeleted: false
    }
  ).lean();
  
  res.render('admin/product/create', model);
});

router.post('/them.html', Passport.requireAuth, upload.single('hinh'), async (req, res) => {
  const lstCategory = await CategoryModel.find(
    {
      isDeleted: false
    }
  ).lean();

  req.checkBody('name', 'Name cannot be empty').notEmpty();

  //req.checkBody('hinh', 'Hình không được rỗng').notEmpty();

  req.checkBody('price', 'Price must be number').isInt();
  //req.checkBody('SL', 'số lượng phải là số').isInt();

  req.checkBody('description', 'Details must not be empty').notEmpty();
  
  const errors = req.validationErrors();

  if (errors) {
    const model = {
      errors,
      category: lstCategory
    };
    
    return res.render('admin/product/create', model);
  }

  const createData = {
    name: req.body.name,
    urlRewriteName: Charset.removeUnicode(req.body.name),
    categoryId: req.body.categoryId,
    description: req.body.description,
    price: req.body.price,
    sale: req.body.sale,
    sale1: req.body.sale1,
    isDeleted: false
  };

  createData.salePrice = createData.price - (createData.sale * createData.price) / 100;

  createData.urlRewriteName = Charset.removeUnicode(req.body.name);

  if (req.file && req.file.filename) {
    createData.photo = req.file.filename;
  }

  await ProductModel.create(createData);

  req.flash('response_message', 'Added Success');

  res.redirect('/admin/product/them.html');
});

router.get('/sua/:id.html', Passport.requireAuth, async (req, res) => {
  const model = {
    errors: null
  };

  model.category = await CategoryModel.find(
    {
      isDeleted: false
    }
  ).lean();

  model.product = await ProductModel.findOne(
    {
      id: req.params.id
    }
  ).lean();

  res.render('admin/product/edit', model);
});

router.post('/sua/:id.html',  upload.single('hinh'), async (req, res) => {
  const lstCategory = await CategoryModel.find(
    {
      isDeleted: false
    }
  ).lean();

  const docProduct = await ProductModel.findOne(
    {
      id: req.params.id
    }
  ).lean();

  if (!docProduct || !docProduct.id) {
    return res.render('admin/product/edit', {
      errors: [
        {
          msg: 'Invalid Input Parameter'
        }
      ],
      category: lstCategory
    });
  }

  req.checkBody('name', 'Name cannot be empty').notEmpty();

  //req.checkBody('hinh', 'Hình không được rỗng').notEmpty();

  req.checkBody('price', 'Price must be number').isInt();

  req.checkBody('description', 'Details must not be empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.render('admin/product/edit', {
      errors,
      category: lstCategory,
      product: docProduct
    });
  }

  const updateData = {
    name: req.body.name,
    categoryId: req.body.categoryId,
    description: req.body.description,
    price: req.body.price,
    sale: req.body.sale,
    sale1: req.body.sale,
  };

  updateData.salePrice = updateData.price - (updateData.sale * updateData.price) / 100;

  updateData.urlRewriteName = Charset.removeUnicode(req.body.name);

  if (!req.file || !req.file.filename) {
    updateData.photo = docProduct.photo;
  }
  else {
    updateData.photo = req.file.filename;
  } 
  
  await ProductModel.update(
    {
      id: docProduct.id
    },
    updateData
  );

  req.flash('response_message', 'Successfully Fixed');

  res.redirect(`/admin/product/sua/${req.params.id}.html`);
});

router.get('/xoa/:id', Passport.requireAuth, async (req, res) => {
  const docProduct = await ProductModel.findOne(
    {
      id: req.params.id,
      isDeleted: false
    }
  ).lean();

  if (!docProduct || !docProduct.id) {
    req.flash('response_message', 'Invalid Input Parameter');
  } else {
    await ProductModel.update(
      {
        id: docProduct.id
      },
      {
        isDeleted: true
      }
    );

    req.flash('response_message', 'Deleted Successfully');
  }

  res.redirect('/admin/product/danh-sach.html');
});

module.exports = router;
