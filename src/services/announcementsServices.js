
import { v4 as uuidv4 } from 'uuid';
import { query } from "../db.js";
import { createWIBTime } from "../lib/lib.js";

export const getAnnouncements = async () => {
   const rows = await query('SELECT * FROM announcements_tb');

   if (rows.length === 0) return rows;

   const rowsWithNames = await Promise.all(rows.map(async (row) => {
      const result = await query('SELECT name FROM accounts_tb WHERE user_id = ?', [row.user_id]);
      return {
         ...row,
         name: result[0]?.name || "Unknown"
      };
   }));

   return rowsWithNames;
}


export const createAnnouncements = async (announcementData) => {
   const { title, content, _id } = announcementData;
   const announcement_id = await generate_announcementID()
   const createdAt = await createWIBTime()
   const result = await query(
      `INSERT INTO announcements_tb (announcement_id, title, content, user_id, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [announcement_id, title, content, _id, createdAt]
   );
   return announcement_id;
};

export const deleteAnnouncements = async (announcementId) => {
   const results = await query(
      `DELETE FROM announcements_tb WHERE announcement_id = ?`,
      [announcementId]
   );
   return results.affectedRows > 0;
};

export const updateAnnouncements = async (announcementData, announcementId) => {
   const { title, content } = announcementData;
   const createdAt = createWIBTime()
   await query(
      `UPDATE announcements_tb SET title = ?, content = ?, created_at = ? WHERE announcement_id = ?`,
      [title.toUppercase(), content, createdAt, announcementId]
   );
   const result = await query(
      `SELECT * FROM announcements_tb WHERE announcement_id = ?`,
      [announcementId]
   );
   return result[0];
};

export const searchAnnouncements = async (searchTerm) => {
   const results = await query(
      `SELECT * FROM announcements_tb WHERE title LIKE ? OR content LIKE ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
   );
   return results;
};

export const getAnnouncementsByUserId = async (userId) => {
   const rows = await query(
      `SELECT * FROM announcements_tb WHERE user_id = ?`,
      [userId]
   );
   return rows;
};

export const getAnnouncementsByAnnouncementId = async (announcementId) => {
   const rows = await query(
      `SELECT * FROM announcements_tb WHERE announcement_id = ?`,
      [announcementId]
   );
   return rows[0];

}


export const getQueueAnnouncements = async () => {
   const rows = await query(`
      SELECT a.*, q.order, q.duration
      FROM announcements_tb a
      JOIN announcements_queue q ON a.announcement_id = q.announcement_id
      ORDER BY q.order ASC
   `);
   return rows;
};



export const createQueueAnnouncements = async (announcementData) => {
   const { announcement_id, order = 0, duration = "" } = announcementData;

   if (!announcement_id) {
      throw new Error("announcement_id is required");
   }

   // ✅ Cek apakah order udah dipake
   const [existingOrder] = await query(
      `SELECT * FROM announcements_queue WHERE \`order\` = ?`,
      [order]
   );

   if (existingOrder) {
      throw new Error(`Order ${order} is already used. Please choose another.`);
   }

   await query(
      `INSERT INTO announcements_queue (announcement_id, \`order\`, duration)
       VALUES (?, ?, ?)`,
      [announcement_id, order, duration]
   );

   const [inserted] = await query(
      `SELECT * FROM announcements_queue WHERE announcement_id = ?`,
      [announcement_id]
   );

   if (!inserted) {
      throw new Error("Insert failed or data not found after insert");
   }

   return inserted;
};



export const updateQueueAnnouncements = async (data, announcementId) => {

   const { order = 0, duration = "" } = data;
   await query(
      `UPDATE announcements_queue SET  \`order\` = ?, duration = ? WHERE announcement_id = ?`,
      [order, duration, announcementId]
   );
   const result = await query(
      `SELECT * FROM announcements_queue WHERE announcement_id = ?`,
      [announcementId]
   );
   return result[0];
};

export const deleteQueueAnnouncements = async (announcementId, order) => {
   const results = await query(
      `DELETE FROM announcements_queue WHERE announcement_id = ? AND \`order\` = ?`,
      [announcementId, order]
   );
   return results.affectedRows > 0;
};


export const autoDelete = async () => {
   const results = await query('DELETE FROM accounts_tb WHERE status = 1');
   return results.affectedRows > 0;
};


//ADDONS HOOKS


const generate_announcementID = async () => {
   let announcement_id;
   let isUnique = false;
   while (!isUnique) {
      announcement_id = uuidv4();
      const [existingId] = await query('SELECT 1 FROM announcements_tb WHERE announcement_id = ? LIMIT 1', [announcement_id]);
      if (!existingId) {
         isUnique = true;
      }
   }
   return announcement_id;
}
