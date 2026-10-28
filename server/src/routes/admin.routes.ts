import { Router } from 'express';
import { adminController as c } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { rateLimit } from '../middlewares/rateLimiter.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { idParam } from '../validators/index.js';
import { adminProductQuery, bannerInputSchema, categoryInputSchema, productInputSchema } from '../validators/admin.js';

const r = Router();
r.use(requireAuth, requireRole('ADMIN')); // enforced on the server; the client-side guard is only UX

r.post('/uploads', rateLimit({ prefix: 'upload', windowSec: 60, max: 30, key: (q) => q.user!.id }), upload.single('file'), c.upload);

r.get('/products', validate({ query: adminProductQuery }), c.products.list);
r.get('/products/:id', validate({ params: idParam }), c.products.get);
r.post('/products', validate({ body: productInputSchema }), c.products.create);
r.put('/products/:id', validate({ params: idParam, body: productInputSchema }), c.products.update);
r.delete('/products/:id', validate({ params: idParam }), c.products.remove);

r.get('/categories', c.categories.list);
r.post('/categories', validate({ body: categoryInputSchema }), c.categories.create);
r.put('/categories/:id', validate({ params: idParam, body: categoryInputSchema }), c.categories.update);
r.delete('/categories/:id', validate({ params: idParam }), c.categories.remove);

r.get('/banners', c.banners.list);
r.post('/banners', validate({ body: bannerInputSchema }), c.banners.create);
r.put('/banners/:id', validate({ params: idParam, body: bannerInputSchema }), c.banners.update);
r.delete('/banners/:id', validate({ params: idParam }), c.banners.remove);

export default r;