const fs = require('fs');
const path = require('path');

const files = {
  '.env': `PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=super_secret_jwt_key_123
`,
  'src/index.ts': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
  'src/config/db.ts': `import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error: any) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};

export default connectDB;
`,
  'src/types/express.d.ts': `import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}
`,
  'src/models/User.ts': `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Sales User'], default: 'Sales User' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
`,
  'src/models/Lead.ts': `import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'], default: 'New' },
  source: { type: String, enum: ['Website', 'Instagram', 'Referral'], required: true }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
`,
  'src/middleware/auth.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      req.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};
`,
  'src/middleware/error.middleware.ts': `import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
`,
  'src/controllers/auth.controller.ts': `import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Sales User'
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id.toString(), user.role)
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id.toString(), user.role)
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`,
  'src/routes/auth.routes.ts': `import express from 'express';
import { register, login } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;
`,
  'src/controllers/lead.controller.ts': `import { Request, Response } from 'express';
import Lead from '../models/Lead';

export const getLeads = async (req: Request, res: Response): Promise<void> => {
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

export const getLeadById = async (req: Request, res: Response): Promise<void> => {
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

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, status, source } = req.body;
    
    if (!name || !email || !source) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const lead = await Lead.create({ name, email, status: status || 'New', source });
    
    res.status(201).json({ success: true, data: lead, message: 'Lead created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLead = async (req: Request, res: Response): Promise<void> => {
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

export const deleteLead = async (req: Request, res: Response): Promise<void> => {
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
`,
  'src/routes/lead.routes.ts': `import express from 'express';
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
`
};

for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

console.log('Backend files generated successfully!');
