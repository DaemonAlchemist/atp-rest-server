/**
 * Created by Andy on 8/25/2017.
 */

import express from 'express';
import userListController from '../controller/user/list';
import userViewController from '../controller/user/view';

const userRoutes = express.Router();

userRoutes.get('/', userListController);
userRoutes.get('/:userName', userViewController);

export default userRoutes;
