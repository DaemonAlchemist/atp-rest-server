/**
 * Created by Andy on 8/25/2017.
 */

import express from 'express';
import loginController from '../controller/login';

const loginRoutes = express.Router();

loginRoutes.post('/', loginController);

export default loginRoutes;
