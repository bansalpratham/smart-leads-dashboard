import express from 'express';
import { getLeads, getLeadById, createLead, updateLead, deleteLead } from '../controllers/lead.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/')
  .get(protect, getLeads)
  .post(protect, adminOnly, createLead);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, adminOnly, updateLead)
  .delete(protect, adminOnly, deleteLead);

export default router;
