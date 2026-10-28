
import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import { siteController } from '../controllers/site.controller.js';
import { authController } from '../controllers/auth.controller.js';
import { catalogController } from '../controllers/catalog.controller.js';
import { cartController } from '../controllers/cart.controller.js';
import { wishlistController } from '../controllers/wishlist.controller.js';
import { orderController } from '../controllers/order.controller.js';
import { userController } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { authLimiter, rateLimit } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';
import * as v from '../validators/index.js';

const router = Router();

// ---- auth
const auth = Router();
auth.post('/register', authLimiter, validate({ body: v.registerSchema }), authController.register);
auth.post('/login', authLimiter, validate({ body: v.loginSchema }), authController.login);
auth.post('/refresh', authController.refresh);
auth.post('/logout', authController.logout);
auth.get('/me', requireAuth, authController.me);
router.use('/auth', auth);

// ---- catalog (public)
router.get('/products', validate({ query: v.productQuerySchema }), catalogController.list);
router.get('/products/facets', catalogController.facets);
router.get('/products/:slug', validate({ params: v.slugParam }), catalogController.detail);
router.get('/categories', catalogController.categories);


// ---- public order tracking (order number + email)
router.post('/track-order', rateLimit({ prefix: 'track', windowSec: 300, max: 10 }), validate({ body: v.trackOrderSchema }), orderController.track);


router.get('/site/home', siteController.home);
router.post('/track-order', rateLimit({ prefix: 'track', windowSec: 300, max: 10 }), validate({ body: v.trackOrderSchema }), orderController.track);
router.use('/admin', adminRoutes);

// ---- authenticated
const secured = Router();
secured.use(requireAuth);

secured.get('/cart', cartController.get);
secured.post('/cart/items', validate({ body: v.addCartItemSchema }), cartController.add);
secured.post('/cart/merge', validate({ body: v.mergeCartSchema }), cartController.merge);
secured.patch('/cart/items/:id', validate({ params: v.idParam, body: v.updateCartItemSchema }), cartController.update);
secured.delete('/cart/items/:id', validate({ params: v.idParam }), cartController.remove);

secured.get('/wishlist', wishlistController.list);
secured.put('/wishlist/:id', validate({ params: v.idParam }), wishlistController.add);
secured.delete('/wishlist/:id', validate({ params: v.idParam }), wishlistController.remove);

secured.post('/orders', rateLimit({ prefix: 'orders', windowSec: 60, max: 10, key: (r) => r.user!.id }), validate({ body: v.placeOrderSchema }), orderController.place);
secured.get('/orders', orderController.list);
secured.get('/orders/:id', validate({ params: v.idParam }), orderController.get);

secured.patch('/me', validate({ body: v.updateProfileSchema }), userController.update);
secured.get('/me/addresses', userController.addresses);
secured.post('/me/addresses', validate({ body: v.addressSchema }), userController.addAddress);
secured.delete('/me/addresses/:id', validate({ params: v.idParam }), userController.deleteAddress);
router.use(secured);





export default router;
