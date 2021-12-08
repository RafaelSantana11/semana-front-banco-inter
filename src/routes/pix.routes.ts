import { Router } from 'express';
import userAuthenticated from '../middlewares/userAuthenticated';
const pixRouter = Router();
pixRouter.use(userAuthenticated);

// const pixController = new UserController();

// pixRouter.post('/signin', pixController.signin);

// pixRouter.post('/signup', pixController.signup);

// pixRouter.get('/signup', pixController.signup);

export default pixRouter;
