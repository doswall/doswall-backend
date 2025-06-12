import path from 'path';
import { fileURLToPath } from 'url';
import * as passwordService from '../services/passwordServices.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const mailPW = async (req, res) => {
   const { email, appkey } = req.body;

   if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
   }
   try {
      const result = await passwordService.mailPW(email, appkey);
      res.status(200).json(result);
   } catch (error) {
      console.error('Error in mailPW:', error);
      res.status(500).json({ success: false, message: error.message });
   }
};


export const updatePasswordLocal = async (req, res) => {
   try {
      const { id } = req.params;
      const result = await passwordService.updatePasswordLocal(req.body, id);
      res.status(200).json(result);
   } catch (error) {
      console.error('Error in updatePasswordLocalController:', error);
      res.status(500).json({ success: false, message: error.message });
   }
}


export const verifyAndUpdatePassword = async (req, res) => {
   try {
      const { id } = req.params;
      const { pin, password, appkey } = req.body;
      const success = await passwordService.verifyAndUpdatePassword(id, pin, password, appkey);
      if (!success) {
         return res.status(400).json({ success: false, message: 'Invalid or expired PIN.' });
      }
      res.status(200).json({ success: true, message: 'Password updated successfully.' });

   } catch (error) {
      console.error('Error in verifyPin:', error);
      res.status(500).json({ success: false, message: 'An error occurred while processing your requestz.' });
   }
};

export const passwordPage = async (req, res) => {
   res.status(200).json({
      msg: "under maintenance mas"
   })
}