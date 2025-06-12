import express from 'express';
import * as clientController from '../controllers/clientController.js';
import * as passwordController from '../controllers/passwordController.js';

const router_appKey = express.Router();

router_appKey.post('/appkey/login', clientController.login)
router_appKey.post('/appkey/getsessiontoken', clientController.getSessionToken)
router_appKey.post('/appkey/password/verify-pin/:id', passwordController.verifyAndUpdatePassword)
router_appKey.post('/appkey/password/mailpw', passwordController.mailPW)
router_appKey.post('/appkey/checktokenstatus', clientController.checkTokenStatus)



export default router_appKey