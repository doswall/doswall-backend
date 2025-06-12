import * as adminService from '../services/adminServices.js';

export const getAdmin = async (req, res) => {
   try {
      const clientData = req.body
      const clients = await adminService.getAdmin(clientData)
      if (!clients) {
         return res.status(404).json({ msg: 'Unauthorized' })
      }
      res.status(200).json(clients)
   } catch (error) {
      console.error('Error in getClientsSuperadmin:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const updateAdmin = async (req, res) => {
   try {
      const clientId = req.params.id
      const clientData = req.body
      const updatedClient = await adminService.updateAdmin(clientData, clientId)
      if (!updatedClient) {
         return res.status(404).json({ msg: 'Unauthorized' })
      }
      res.status(200).json(updatedClient)
   } catch (error) {
      console.error('Error in updateClientsSuperadmin:', error)
      res.status(500).json({ msg: error.message })
   }
}



export const createClients = async (req, res) => {
   try {
      const result = await adminService.createClients(req.body);

      if (result.success) {
         res.status(201).json(result.data);
      } else {
         res.status(400).json(result);
      }
   } catch (error) {
      handleError(res, error, 400);
   }
};

export const deleteClients = async (req, res) => {
   try {
      const clientId = req.params.id;
      const adminId = req.body._id;
      const result = await adminService.deleteClients(clientId, adminId);

      if (result.success) {
         res.status(200).json(result.data);
      } else {
         res.status(404).json(result);
      }
   } catch (error) {
      handleError(res, error);
   }
};


