const Koa = require('koa');
const Router = require('koa-router');
const User = require('./models/User');
const mongoose = require('mongoose');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = { error: err.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  }
});

const router = new Router();

router.get('/users', async (ctx) => {
  ctx.body = await User.find({});
});

router.get('/users/:id', async (ctx) => {
  if (mongoose.Types.ObjectId.isValid(ctx.params.id)) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.status = 404;
      return;
    }
    ctx.body = user;
  } else {
    ctx.status = 400;
  }
});

router.patch('/users/:id', async (ctx) => {
  const userId = ctx.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    makeErrorResponse(ctx, 'Неправильный id');
    return;
  }
  const reqEmail = ctx.request.body.email;
  if (!validateEmail(reqEmail)) {
    makeErrorResponse(ctx, 'Некорректный email');
    return;
  }

  await User.findByIdAndUpdate(userId, {
    email: ctx.request.body.email,
    displayName: ctx.request.body.displayName,
  }, {new: true})
      .then((user) => {
        ctx.body = user;
      })
      .catch((err) => {
        makeErrorResponse(ctx, err.errors.email.message);
      });
});

router.post('/users', async (ctx) => {
  await User.create({email: ctx.request.body.email,
    displayName: ctx.request.body.displayName})
      .then((user) => {
        ctx.body = user;
      }).catch((err) => {
        makeErrorResponse(ctx, err.errors.email.message);
      });
});

router.delete('/users/:id', async (ctx) => {
  const userId = ctx.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    makeErrorResponse(ctx, 'Неправильный id');
    return;
  }
  const deleteUser = await User.deleteOne({_id: userId});
  if (deleteUser.deletedCount === 0) {
    ctx.status = 404;
  } else {
    ctx.body = deleteUser;
  }
});

app.use(router.routes());

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function makeErrorResponse(ctx, errorMessage) {
  ctx.status = 400;
  ctx.body = {
    errors: {email: errorMessage},
  };
}

module.exports = app;
