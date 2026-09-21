const User = require('../models/User');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    
    // Attach count of owned accounts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const count = await Customer.countDocuments({ ownerId: u._id });
        return {
          ...u.toObject(),
          assignedAccountsCount: count,
        };
      })
    );

    return res.json(usersWithCounts);
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'CSM',
      department: department || 'Customer Success',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_CREATE',
      entityType: 'User',
      entityId: user._id,
      after: { name: user.name, email: user.email, role: user.role },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ message: 'Failed to create user.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const before = { role: user.role, department: user.department };
    if (role) user.role = role;
    if (department) user.department = department;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_ROLE_UPDATE',
      entityType: 'User',
      entityId: user._id,
      before,
      after: { role: user.role, department: user.department },
    });

    return res.json(user);
  } catch (error) {
    console.error('updateUserRole error:', error);
    return res.status(500).json({ message: 'Failed to update user role.' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(parseInt(limit));
    return res.json(logs);
  } catch (error) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ message: 'Failed to fetch audit logs.' });
  }
};
