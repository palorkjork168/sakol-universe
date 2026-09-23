const { Op } = require("sequelize");
const {
  Notification,
  Company,
  CompanyUserRole,
  Role,
  Permission,
} = require("../models");

class NotificationService {
  /**
   * Resolve user IDs of company owner and users with a specific permission within that company
   */
  async getCompanyRecipients(companyId, permissionName) {
    if (!companyId) return [];

    const recipients = new Set();

    // 1. Company Owner
    const company = await Company.findByPk(companyId, {
      attributes: ["id", "owner_id"],
    });
    if (company && company.owner_id) {
      recipients.add(company.owner_id);
    }

    // 2. Company-scoped roles holding the required permission
    const companyRoles = await CompanyUserRole.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: Role,
          as: "role",
          required: true,
          include: [
            {
              model: Permission,
              as: "permissions",
              where: { name: permissionName },
              required: true,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    for (const cr of companyRoles) {
      if (cr.user_id) {
        recipients.add(cr.user_id);
      }
    }

    return Array.from(recipients);
  }

  /**
   * Create a notification for a single user with optional deduplication
   */
  async notifyUser({
    userId,
    type,
    title,
    message,
    link = null,
    metadata = {},
    transaction = null,
    deduplicationKey = null,
  }) {
    if (!userId) return null;

    const meta = { ...metadata };
    if (deduplicationKey) {
      meta.deduplication_key = deduplicationKey;

      // Check if duplicate notification exists
      const existing = await Notification.findOne({
        where: {
          user_id: userId,
          type,
          metadata: {
            deduplication_key: deduplicationKey,
          },
        },
        transaction,
      });

      if (existing) {
        return existing;
      }
    }

    return await Notification.create(
      {
        user_id: userId,
        type,
        title,
        message,
        link,
        metadata: meta,
        is_read: false,
      },
      { transaction }
    );
  }

  /**
   * Notify multiple users with the same event payload
   */
  async notifyUsers(userIds, payload, transaction = null) {
    if (!Array.isArray(userIds) || userIds.length === 0) return [];

    const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean);
    const notifications = [];

    for (const uid of uniqueUserIds) {
      // Exclude self-notifications if actorId is specified
      if (payload.actorId && payload.actorId === uid) {
        continue;
      }

      const notif = await this.notifyUser({
        ...payload,
        userId: uid,
        transaction,
      });
      if (notif) {
        notifications.push(notif);
      }
    }

    return notifications;
  }

  /**
   * Get paginated notifications for a specific user
   */
  async getUserNotifications(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const where = { user_id: userId };

    if (query.is_read !== undefined && query.is_read !== "") {
      where.is_read = query.is_read === "true" || query.is_read === true;
    }

    if (query.type) {
      where.type = query.type;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return {
      notifications: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1,
      },
    };
  }

  /**
   * Get total count of unread notifications for a user
   */
  async getUnreadCount(userId) {
    const unreadCount = await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    return { unreadCount };
  }

  /**
   * Mark a single notification as read (strictly owned by caller)
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }

    if (!notification.is_read) {
      await notification.update({
        is_read: true,
        read_at: new Date(),
      });
    }

    return notification;
  }

  /**
   * Mark all unread notifications as read for a user
   */
  async markAllAsRead(userId) {
    const [updatedCount] = await Notification.update(
      {
        is_read: true,
        read_at: new Date(),
      },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    );

    return { success: true, updatedCount };
  }
}

module.exports = new NotificationService();
