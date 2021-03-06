import express from 'express';
import swaggerUI from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import userRouter from './userRoute';
import socialRouter from './socialRoute';
import authorRouter from './authorRoute';
import bookRouter from './bookRoute';
import paymentRouter from './paymentRouter';

const router = express();
const swaggerApiDoc = yaml.load(`${__dirname}/../docs/hellobooks_api_doc.yaml`);

router.set('views', path.join(__dirname, '/../views'));
router.use(express.static(path.join(__dirname, '/../public')));

router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerApiDoc));

router.get('/', (req, res) => {
  res.status(200).json({ message: 'This is Hello books' });
});

router.use('/auth', userRouter);
router.use('/oauth', socialRouter);
router.use('/authors', authorRouter);
router.use('/books', bookRouter);
router.use('/payments', paymentRouter);

export default router;
