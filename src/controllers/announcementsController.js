import * as announcementsService from '../services/announcementsServices.js'

export const getAnnouncements = async (req, res) => {
   try {
      const announcements = await announcementsService.getAnnouncements()
      res.status(200).json(announcements)
   } catch (error) {
      console.error('Error in getAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const createAnnouncements = async (req, res) => {
   try {
      const data = req.body
      const newAnnouncements = await announcementsService.createAnnouncements(data)
      res.status(200).json({ _id: newAnnouncements })
   } catch (error) {
      console.error('Error in createAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const updateAnnouncements = async (req, res) => {
   try {
      const announcementsId = req.params.id
      const announcementsData = req.body
      const updatedAnnouncements = await announcementsService.updateAnnouncements(announcementsData, announcementsId)
      if (!updatedAnnouncements) {
         return res.status(404).json({ msg: 'announcements not found' })
      }
      res.status(200).json(updatedAnnouncements)
   } catch (error) {
      console.error('Error in updateAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const getAnnouncementsByUserId = async (req, res) => {

   try {
      const userId = req.params.id
      const announcements = await announcementsService.getAnnouncementsByUserId(userId)
      if (!announcements) {
         return res.status(404).json({ msg: 'announcements not found' })
      }
      res.status(200).json(announcements)
   } catch (error) {
      console.error('Error in getAnnouncementsById:', error)
      res.status(500).json({ msg: error.message })
   }
}
export const getAnnouncementsByAnnouncementId = async (req, res) => {
   try {
      const announcementId = req.params.id
      const announcements = await announcementsService.getAnnouncementsByAnnouncementId(announcementId)
      if (!announcements) {
         return res.status(404).json({ msg: 'announcements not found' })
      }
      res.status(200).json(announcements)
   } catch (error) {
      console.error('Error in getAnnouncementsById:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const deleteAnnouncements = async (req, res) => {
   try {
      const announcementsId = req.params.id
      const deleted = await announcementsService.deleteAnnouncements(announcementsId)
      if (!deleted) {
         return res.status(404).json({ msg: 'announcements not found' })
      }
      res.status(200).json({
         msg: `announcements deleted successfully`,
         announcementsId
      })
   } catch (error) {
      console.error('Error in deleteAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const searchAnnouncements = async (req, res) => {
   try {
      const searchTerm = req.query.q
      const announcements = await announcementsService.searchAnnouncements(searchTerm)
      res.status(200).json(announcements)
   } catch (error) {
      console.error('Error in searchAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const getQueueAnnouncements = async (req, res) => {
   try {
      const announcements = await announcementsService.getQueueAnnouncements()
      res.status(200).json({
         success: true,
         data: announcements
      })
   } catch (error) {
      console.error('Error in queueAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const createQueueAnnouncements = async (req, res) => {
   try {
      const data = req.body
      const newAnnouncements = await announcementsService.createQueueAnnouncements(data)
      res.status(200).json(
         res.status(200).json({
            success: true,
            data: newAnnouncements
         })
      )
   } catch (error) {
      console.error('Error in createQueueAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const updateQueueAnnouncements = async (req, res) => {
   try {
      const announcementsId = req.params.id
      const announcementData = req.body
      const updatedAnnouncements = await announcementsService.updateQueueAnnouncements(announcementData, announcementsId)
      if (!updatedAnnouncements) {
         return res.status(404).json({ msg: 'announcements not found' })
      }
      res.status(200).json({
         success: true,
         ...updatedAnnouncements
      })
   } catch (error) {
      console.error('Error in updateQueueAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}

export const deleteQueueAnnouncements = async (req, res) => {
   try {
      const announcementsId = req.params.id
      const announcementOrder = req.body.order
      const deleted = await announcementsService.deleteQueueAnnouncements(announcementsId, announcementOrder)
      if (!deleted) {
         return res.status(404).json({ msg: 'announcements not found' })
      }
      res.status(200).json({
         success: true,
         msg: `announcements deleted successfully`,
         announcementsId
      })
   } catch (error) {
      console.error('Error in deleteQueueAnnouncements:', error)
      res.status(500).json({ msg: error.message })
   }
}
