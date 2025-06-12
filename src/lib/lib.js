import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

export const generatePin = () => {
   return Math.floor(100000 + Math.random() * 900000);
};

export const checkAppKey = (appkey) => {
   const appKey = process.env.APP_KEY
   if (appkey !== appKey) {
      return false
   }
   return true
}

export const createWIBTime = () => {
   const jakartaDate = new Date();
   const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
   });

   const parts = formatter.formatToParts(jakartaDate).reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
   }, {});

   // ✅ ISO format string: 2025-05-09T16:22:09
   return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
};


export const sendEmail = async (email, _id, pin) => {
   let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: 'richky.abednego@gmail.com',
         pass: 'kast cuyh ciar thzf',
      }
   });

   let mailOptions = {
      from: 'Doegus Admin',
      to: email,
      subject: 'Change your Password Doegus App',
      text: `Your PIN to change password is: ${pin}. This PIN will expire in 10 minutes.`,
      html: `<div>
         <p>Your PIN to change password is: <strong>${pin}</strong>. This PIN will expire in 10 minutes.</p>
         <a href="${process.env.URL}/password/page/${_id}?pin=${pin}">Click To Create New Password.</a>
         <h3>For now, The LINK DID NOT WORK !</h3>
         </div>`
   };

   await transporter.sendMail(mailOptions);
};



export const validateEmail = (email) => {
   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return re.test(String(email).toLowerCase());
};


export const sanitizeInput = (input) => {
   return input.replace(/[^\w\s@.-]/gi, '');
};


export const getLocations = async (lat, lon) => {
   const radius = 200;
   const query = `
   [out:json];
   (
     node(around:${radius}, ${lat}, ${lon})["name"];
     way(around:${radius}, ${lat}, ${lon})["name"];
     relation(around:${radius}, ${lat}, ${lon})["name"];
   );
   out center;
   `;

   const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
   const response = await fetch(url);
   if (!response.ok) {
      throw new Error('Failed to fetch data from Overpass API');
   }

   const data = await response.json();

   // Calculate distance for each element and sort by distance
   const locationNames = data.elements
      .filter(el => el.tags?.name && (el.lat || el.center?.lat))
      .map(el => {
         // Use element's coordinates or center coordinates if available
         const elementLat = el.lat || el.center?.lat;
         const elementLon = el.lon || el.center?.lon;

         // Calculate distance using Haversine formula (more accurate for Earth distances)
         const R = 6371; // Earth radius in km
         const dLat = (elementLat - lat) * Math.PI / 180;
         const dLon = (elementLon - lon) * Math.PI / 180;
         const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(elementLat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
         const distance = R * c * 1000; // Distance in meters

         return {
            name: el.tags.name,
            distance: distance
         };
      })
      .sort((a, b) => a.distance - b.distance) // Sort by distance ascending
      .map(item => item.name) // Extract just the names
      .slice(0, 40); // Get closest 40 locations

   return locationNames.slice(0, 5);
};