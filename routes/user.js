const router = require('express').Router();

const BcryptJs = require('bcryptjs');
const Passport = require('../modules/passport');
const UserModel = require('../models/user');
const UserRole = require('../constants/user-role');

router.get('/dang-nhap.html', (req, res) => {
  const model = {
    callbackUrl: '/dang-nhap.html'
  };

  if (req.query.returnUrl && req.query.returnUrl.length > 0) {
    model.callbackUrl = `${model.callbackUrl}?returnUrl=${req.query.returnUrl}`;
  }

  res.render('site/login', model);
});

router.post('/dang-nhap.html', Passport.auth(), (req, res) => {
  let sReturnUrl = undefined;

  if (req.query.returnUrl && req.query.returnUrl.length > 0) {
    sReturnUrl = decodeURI(req.query.returnUrl);
  }
  
  if (!sReturnUrl) {
    return res.redirect('/');
  }
  else {
    return res.redirect(sReturnUrl);
  }
});

router.get('/dang-xuat.html', (req, res) => {
  req.logout();
  res.redirect('/dang-nhap.html');
});

router.get('/dang-ky.html', (req, res) => {
  res.render('site/register', {
    errors: null
  });
});

router.post('/dang-ky.html', async (req, res) => {
  const respData = {
    isSucceed: false,
    errors: null,
    message: 'Failure'
  };

  if (req.isAuthenticated() === false) {
    req.checkBody('fullname', 'Name cannot be empty').notEmpty();

    req.checkBody('fullname', 'Name from 6 to 30 characters').isLength({
      min:6,
      max:30
    });

    req.checkBody('email', 'Email cannot be empty').notEmpty();

    req.checkBody('email', 'Invalid Email Format').isEmail();

    req.checkBody('password', 'Password cannot be empty').notEmpty();
    req.checkBody('password', 'Password must be more than 6 character').isLength({
      min:6,
      
    });

    req.checkBody('repassword', 'Re-entered password cannot be empty').notEmpty();

    respData.errors = req.validationErrors();
  
    if (respData.errors) {
      // return res.render('site/register', {
      //   errors
      // });
      return res.json(respData);
    }
    else if (req.body.password !== req.body.repassword) {
      // return res.render('site/register', {
      //   errors: [
      //     {
      //       msg: 'Mật khẩu không hợp lệ'
      //     }
      //   ]
      // });
      respData.errors = [
        {
          msg: 'Invalid password'
        }
      ];

      return res.json(respData);
    }

    const sEmail = req.body.email.trim().toLowerCase();
    
    const lst = await UserModel.find(
      {
        email: sEmail
      }
    ).lean();

    if (lst && lst.length > 0) {
      // return res.render('site/register', {
      //   errors: [
      //     {
      //       msg: 'Email đã tồn tại'
      //     }
      //   ]
      // });
      respData.errors = [
        {
          msg: 'Email already exists'
        }
      ];
      
      return res.json(respData);
    }
    
    const sHashSalt = BcryptJs.genSaltSync(16);

    const sPassword = BcryptJs.hashSync(req.body.password, sHashSalt);
    
    await UserModel.create(
      {
        fullname: req.body.fullname,
        email: sEmail,
        password: sPassword,
        roles: [
          UserRole.customer
        ]
      }
    );

    // req.flash('response_message', 'Đã Đăng Ký Thành Công');
    respData.isSucceed = true;
    respData.message = 'Successful';
  }
  
  // return res.redirect('/');
  // return res.render('site/register', {
  //   errors: [
  //     {
  //       msg: '11111111111111'
  //     }
  //   ]
  // });
  return res.json(respData);
});

module.exports = router;
