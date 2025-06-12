import { query } from "../db.js";
import { checkAppKey, generatePin, sendEmail } from "../lib/lib.js";

export const mailPW = async (clientEmail, appkey) => {
   const isValid = await checkAppKey(appkey);
   if (!isValid) {
      throw new Error("Unauthorized");
   }
   try {
      const selected = await query(
         `SELECT * FROM accounts_tb WHERE email = ?`,
         [clientEmail]
      );
      if (selected) {
         const clientId = selected[0].user_id;

         const newPin = generatePin()
         const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
         await query(
            'INSERT INTO password_reset_pins (user_id, pin, expires_at) VALUES (?, ?, ?)',
            [clientId, newPin, expiresAt]
         );

         await sendEmail(clientEmail, clientId, newPin);
         return { success: true, message: 'Email sent.' };
      }
   } catch (error) {
      console.error('Error in forgotPassword service:', error);
      throw new Error('An error occurred while processing your request sending password reset email.');
   }
};


export const updatePasswordLocal = async (data, user_id) => {
   try {
      const [selectedUser] = await query(`SELECT password FROM accounts_tb WHERE user_id = ?`, [user_id]);
      if (!selectedUser) {
         throw new Error('User not found.');
      }
      const isOldPasswordValid = data.oldPW === selectedUser.password;
      if (!isOldPasswordValid) {
         throw new Error('Old password is incorrect.');
      }
      await query(`UPDATE accounts_tb SET password = ? WHERE user_id = ?`, [data.newPW, user_id]);
      return { success: true, message: 'Password updated successfully.' };
   } catch (error) {
      console.error('Error in updatePasswordLocal service:', error);
      throw new Error(error.message || 'An error occurred while processing your request updating password locally.');
   }
};

export const verifyAndUpdatePassword = async (id, pin, password, appkey) => {
   const isValid = await checkAppKey(appkey);
   if (!isValid) {
      throw new Error("Unauthorized");
   }
   try {
      const rows = await query(
         'SELECT * FROM password_reset_pins WHERE user_id = ? AND pin = ? AND expires_at > NOW()',
         [id, pin]
      );

      if (rows.length === 0) return false;

      await query('UPDATE accounts_tb SET password = ? WHERE user_id = ?', [password, id]);
      await query('DELETE FROM password_reset_pins WHERE user_id = ?', [id]);

      return true;
   } catch (error) {
      console.error('Error in verifyAndUpdatePassword service:', error);
      throw new Error('An error occurred while processing your request verifying and updating password.');
   }
};