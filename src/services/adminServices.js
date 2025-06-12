import dotenv from 'dotenv';
import { v4 as uuidv4 } from "uuid";
import { query } from '../db.js';
import { createWIBTime, validateEmail } from "../lib/lib.js";

dotenv.config()


export const getAdmin = async (data) => {
   const account = await query('SELECT role FROM accounts_tb WHERE user_id = ?', [data._id]);

   if (!account[0] || account[0].role === 'user') {
      return false;
   }

   const results = await query('SELECT * FROM accounts_tb');
   return results;
};

export const updateAdmin = async (adminData, clientId) => {
   const { name, email, password, geotag, status, role, notes, _id } = adminData;


   const account = await query('SELECT role FROM accounts_tb WHERE user_id = ?', [_id]);

   if (!account[0] || account[0].role === 'user') {
      return false;
   }

   await query(
      `UPDATE accounts_tb SET name = ?, email = ?, password = ?, geotag = ?, status = ?, role = ?, notes = ?
      WHERE user_id = ?`,
      [name.toUpperCase(), email, password, geotag.toUpperCase(), status, role, notes, clientId]
   );

   const results = await query('SELECT * FROM accounts_tb WHERE user_id = ?', [clientId]);
   return results[0];
};


export const createClients = async (adminData) => {
   try {
      const { name, password, email, _id } = adminData;

      if (!name || !password || !email) {
         throw new Error("Name, password and email are required");
      }

      if (!validateEmail(email)) {
         throw new Error("Invalid email format");
      }

      const account = await query('SELECT role FROM accounts_tb WHERE user_id = ?', [_id]);

      if (!account[0] || account[0].role === 'user') {
         return false;
      }

      const existingUser = await query('SELECT 1 FROM accounts_tb WHERE email = ? LIMIT 1', [email]);
      if (existingUser.length > 0) {
         throw new Error("Email already in use");
      }


      const user_id = await generate_UserID()
      const status = adminData.status || 0;
      const geotag = adminData.geotag ? adminData.geotag.toUpperCase() : "";
      const role = adminData.role || "user";
      const notes = adminData.notes || "";
      const token = await generate_UserToken()
      const token_timestamp = createWIBTime();

      await query(
         `INSERT INTO accounts_tb (user_id, name, password, email, geotag, status, role, notes, token, token_timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         [user_id, name.toUpperCase(), password, email, geotag, status, role, notes, token, token_timestamp]
      );

      const [newUser] = await query(
         'SELECT user_id, name, email, geotag, status, role, notes FROM accounts_tb WHERE user_id= ? LIMIT 1',
         [user_id]
      );

      return {
         success: true,
         data: newUser
      };
   } catch (error) {
      return {
         success: false,
         error: error.message
      };
   }
};


export const deleteClients = async (clientId, _id) => {
   try {
      if (!clientId) {
         throw new Error("Client ID is required");
      }

      const account = await query('SELECT role FROM accounts_tb WHERE user_id = ?', [_id]);

      if (!account[0] || account[0].role === 'user') {
         return false;
      }

      const result = await query('DELETE FROM accounts_tb WHERE user_id= ?', [clientId]);

      if (result.affectedRows === 0) {
         throw new Error("User not found");
      }

      return {
         success: true,
         message: "User deleted successfully"
      };
   } catch (error) {
      return {
         success: false,
         error: error.message
      };
   }
};



// ADDONS HOOKS

const generate_UserID = async () => {
   let userId;
   let isUnique = false;

   while (!isUnique) {
      userId = uuidv4();
      const [existingId] = await query('SELECT 1 FROM accounts_tb WHERE user_id= ? LIMIT 1', [userId]);
      if (!existingId) {
         isUnique = true;
      }
   }

   return userId;
};

const generate_UserToken = async () => {
   let token;
   let isUnique = false;

   while (!isUnique) {
      token = uuidv4()
      const [existingToken] = await query('SELECT 1 FROM accounts_tb WHERE token = ? LIMIT 1', [token]);
      if (!existingToken) {
         isUnique = true;
      }
   }

   return token;
};
