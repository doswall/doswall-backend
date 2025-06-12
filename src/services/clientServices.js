import { v4 as uuidv4 } from "uuid";
import { query } from "../db.js";
import { checkAppKey, createWIBTime, getLocations, validateEmail } from "../lib/lib.js";



// AUTHENTICATION
export const login = async (email, password, appkey) => {
   const isValid = await checkAppKey(appkey);
   if (!isValid) {
      throw new Error("Unauthorized");
   }

   if (!validateEmail(email)) {
      throw new Error("Invalid email format");
   }

   const results = await query(`SELECT * FROM accounts_tb WHERE email = ?`, [email]);
   if (results.length === 0) {
      throw new Error("Invalid email or password");
   }

   const user = results[0];
   const isPasswordValid = password === user.password;

   if (!isPasswordValid) {
      throw new Error("Invalid email or password");
   }

   // Cek dan update token jika token_timestamp lebih dari 12 jam yang lalu
   const currentDate = createWIBTime(); // format: '2025-05-14T12:23:00'
   const lastTokenTime = new Date(user.token_timestamp);
   const now = new Date(currentDate);

   const timeDiffInMs = now.getTime() - lastTokenTime.getTime();
   const isTokenOutdated = timeDiffInMs > 86_400_000; // 24 jam = 86.400.000 ms


   let finalToken = user.token;

   if (isTokenOutdated) {
      const newToken = uuidv4();
      const newTimestamp = currentDate;

      await query(`UPDATE accounts_tb SET token = ?, token_timestamp = ? WHERE user_id = ?`, [
         newToken,
         newTimestamp,
         user.user_id,
      ]);

      finalToken = newToken;
   }

   return {
      success: true,
      data: {
         user_id: user.user_id,
         name: user.name,
         email: user.email,
         role: user.role,
         status: user.status,
         geotag: user.geotag,
         notes: user.notes,
         token: finalToken
      }
   };
};

// LOCATION SERVICES
export const getLocationLists = async (data) => {
   try {
      if (!data.lat || !data.long) {
         throw new Error("Latitude and longitude are required");
      }
      const locationLists = await getLocations(data.lat, data.long);
      return {
         success: true,
         data: locationLists
      };
   } catch (error) {
      return {
         success: false,
         error: error.message || "Failed to get locations"
      };
   }
};

// SESSION MANAGEMENT
export const getSessionToken = async (data) => {
   const isValid = await checkAppKey(data.appkey);
   if (!isValid) {
      throw new Error("Unauthorized");
   }

   const results = await query(`SELECT token FROM accounts_tb WHERE user_id= ?`, [data.user_id]);
   if (results.length === 0) {
      throw new Error("User not found");
   }

   return {
      success: true,
      data: { token: results[0].token }
   }
};

// USER MANAGEMENT
export const getClients = async () => {
   try {
      const results = await query('SELECT user_id, name, email, geotag, status, role, notes FROM accounts_tb');
      return {
         success: true,
         data: results
      };
   } catch (error) {
      return {
         success: false,
         error: "Failed to fetch clients"
      };
   }
};
export const getClientsByUserId = async (clientId) => {
   try {
      if (!clientId) {
         throw new Error("Client ID is required");
      }

      const results = await query(
         'SELECT user_id, name, email, geotag, status, role, notes FROM accounts_tb WHERE user_id= ?',
         [clientId]
      );

      if (results.length === 0) {
         throw new Error("User not found");
      }

      return {
         success: true,
         data: results[0]
      };
   }
   catch (error) {
      return {
         success: false,
         error: error.message
      };
   }
}



export const updateClients = async (clientData, clientId) => {
   try {
      if (!clientId) {
         throw new Error("Client ID is required");
      }

      const lastUpdated = createWIBTime()
      const { status, notes = "", geotag = "" } = clientData;
      if (status === 0) {
         await query(
            `UPDATE accounts_tb SET status = ?, notes = ? , geotag = "", last_update = ? WHERE user_id= ?`,
            [status, notes, lastUpdated, clientId]
         );
      }
      else {
         await query(
            `UPDATE accounts_tb SET status = ?, notes = ?, geotag = ?, last_update = ? WHERE user_id= ?`,
            [status, notes, geotag.toUpperCase(), lastUpdated, clientId]
         );
      }

      const [updatedUser] = await query(
         'SELECT user_id, name, email, geotag, status, role, notes, last_update FROM accounts_tb WHERE user_id= ? LIMIT 1',
         [clientId]
      );

      if (!updatedUser) {
         throw new Error("User not found");
      }

      return {
         success: true,
         data: updatedUser
      };
   } catch (error) {
      return {
         success: false,
         error: error.message
      };
   }
};



export const checkTokenStatus = async (data) => {
   const isValid = await checkAppKey(data.appkey);
   if (!isValid) {
      throw new Error("Unauthorized");
   }

   try {
      if (!data.token || !data.user_id) {
         throw new Error("Credentials Required");
      }
      const user = await query('SELECT * FROM accounts_tb WHERE user_id= ? AND token= ? LIMIT 1', [data.user_id, data.token]);

      if (user.length === 0) {
         return {
            success: true,
            tokenStatus: false
         }
      }
      else {
         return {
            success: true,
            tokenStatus: true
         }
      }

   } catch (error) {
      return {
         success: false,
         error: error.message
      };
   }
};




