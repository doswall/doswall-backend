import * as clientService from '../services/clientServices.js';

// Helper function for consistent error responses
const handleError = (res, error, statusCode = 500) => {
   console.error(error);
   res.status(statusCode).json({
      success: false,
      error: error.message || 'Internal server error'
   });
};

export const login = async (req, res) => {
   try {
      const { email, password, appkey } = req.body;
      const result = await clientService.login(email, password, appkey);

      if (result.success) {
         res.status(200).json(result.data);
      } else {
         res.status(401).json(result);
      }
   } catch (error) {
      handleError(res, error, 401);
   }
};

export const getClients = async (req, res) => {
   try {
      const result = await clientService.getClients();
      res.status(200).json(result);
   } catch (error) {
      handleError(res, error);
   }
};


export const getClientsByUserId = async (req, res) => {
   try {
      const userId = req.params.id;
      const result = await clientService.getClientsByUserId(userId);
      if (result.success) {
         res.status(200).json(result.data);
      }
      else {
         res.status(404).json(result);
      }
   } catch (error) {
      handleError(res, error, 400);
   }
}

export const updateClients = async (req, res) => {
   try {
      const clientId = req.body._id;
      const result = await clientService.updateClients(req.body, clientId);

      if (result.success) {
         res.status(200).json(result.data);
      } else {
         res.status(404).json(result); // 404 if not found
      }
   } catch (error) {
      handleError(res, error);
   }
};





export const getLocationLists = async (req, res) => {
   try {
      const { lat, long } = req.body;

      if (!lat || !long) {
         return res.status(400).json({
            success: false,
            error: 'Latitude and longitude are required'
         });
      }


      const result = await clientService.getLocationLists({ lat, long });
      if (!result.success) {
         return res.status(404).json(result);
      }
      res.status(200).json(result.data);
   } catch (error) {
      handleError(res, error);
   }
};

export const getSessionToken = async (req, res) => {
   try {
      const result = await clientService.getSessionToken(req.body);

      if (result.success) {
         res.status(200).json(result.data);
      } else {
         res.status(401).json(result);
      }
   } catch (error) {
      handleError(res, error, 401);
   }
};

export const checkTokenStatus = async (req, res) => {
   try {
      const result = await clientService.checkTokenStatus(req.body);
      if (result.success) {
         res.status(200).json(result);
      } else {
         res.status(401).json(result);
      }
   } catch (error) {
      handleError(res, error, 401);
   }
};