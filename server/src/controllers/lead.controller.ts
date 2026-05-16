import { Request, Response } from 'express';
import Lead from '../models/Lead';

export const getLeads = async (req: Request, res: Response) => {
  console.log('Fetching leads with query:', req.query);

  try {
    const { page = 1, limit = 10, search = '', status, source, sort = 'Latest' } = req.query;
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (source) {
      query.source = source;
    }

    const sortOptions: any = sort === 'Oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const totalRecords = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalRecords / limitNumber);

    res.json({
      success: true,
      data: leads,
      currentPage: pageNumber,
      totalPages,
      totalRecords,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeadById = async (req: Request, res: Response) => {

  try {
    const lead = await Lead.findById(req.params.id);
    if (lead) {
      res.json({ success: true, data: lead });
    } else {
      res.status(404).json({ success: false, message: 'Lead not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLead = async (req: Request, res: Response) => {

  try {
    const { name, email, status, source } = req.body;
    
    if (!name || !email || !source) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      return;
    }

    const validStatuses = ['New', 'Contacted', 'Qualified', 'Lost'];
    if (status && !validStatuses.includes(status)) {
       res.status(400).json({ success: false, message: 'Invalid status provided' });
       return;
    }

    const validSources = ['Website', 'Instagram', 'Referral'];
    if (!validSources.includes(source)) {
       res.status(400).json({ success: false, message: 'Invalid source provided' });
       return;
    }

    const lead = await Lead.create({ name, email, status: status || 'New', source });
    
    res.status(201).json({ success: true, data: lead, message: 'Lead created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLead = async (req: Request, res: Response) => {

  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (lead) {
      res.json({ success: true, data: lead, message: 'Lead updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Lead not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLead = async (req: Request, res: Response) => {

  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (lead) {
      res.json({ success: true, message: 'Lead deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Lead not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
