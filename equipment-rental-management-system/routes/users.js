const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

/* Get all users (Admin only) */
router.get('/', authenticateToken, requireRole(['admin','staff']), async (req, res) => {
  try {
    // Check if pagination is requested
    const hasLimit = req.query.limit !== undefined && req.query.limit !== '';
    const page = hasLimit ? parseInt(req.query.page) || 1 : null;
    const limit = hasLimit ? parseInt(req.query.limit) || 10 : null;
    const offset = hasLimit ? (page - 1) * limit : null;

    let users;
    let totalCount = null;

    if (hasLimit) {
      // Get total count for pagination
      const [[{ totalCount: count }]] = await db.execute('SELECT COUNT(*) AS totalCount FROM users');
      totalCount = count;

      // Get paginated users with ordering
      const [paginatedUsers] = await db.execute(
        'SELECT id, email, first_name, last_name, phone, address, role, created_at, is_active FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      users = paginatedUsers;
    } else {
      // Get all users without pagination
      const [allUsers] = await db.execute(
        'SELECT id, email, first_name, last_name, phone, address, role, created_at, is_active FROM users ORDER BY created_at DESC'
      );
      users = allUsers;
    }

    const response = {
      success: true,
      data: users
    };

    if (hasLimit) {
      response.pagination = {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/* Update user active status (Admin only) */
router.put('/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'Invalid is_active value' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;