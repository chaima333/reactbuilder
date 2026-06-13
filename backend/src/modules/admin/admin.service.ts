import {
  User,
  ActivityLog,
  Site,
  Page,
  Plugin,
} from "../../models";

import { Op } from "sequelize";

export const fetchPendingUsers = async (adminId: number) => {
  return await User.findAll({
    where: {
      isApproved: false,
      id: { [Op.not]: adminId },
    },
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
};

export const approveUserById = async (userId: number, adminId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("Utilisateur non trouvé");

  await user.update({ isApproved: true });

  await ActivityLog.create({
    userId: adminId,
    action: "user_approved",
    entityType: "user",
    entityId: user.id,
    details: { name: user.name, email: user.email },
  } as any);

  return user;
};

export const deleteUserById = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("Utilisateur non trouvé");

  await user.destroy();
  return true;
};

export const getPlatformStats = async () => {
  const [
    totalUsers,
    pendingUsers,
    totalSites,
    totalPages,
    totalPlugins,
    totalActivities,
    publishedPages,
    activeSites,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { isApproved: false } }),
    Site.count(),
    Page.count(),
    (Plugin as any).count(),
    ActivityLog.count(),
    Page.count({ where: { status: "published" } }),
    Site.count({ where: { status: "active" } }),
  ]);

 return {
  totalUsers,
  pendingUsers,
  totalSites,
  totalPages,
  totalPlugins,
  totalActivityLogs: totalActivities,
  publishedPages,
  activeSites,
};
};

export const fetchAdminUsers = async () => {
  return await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
};

export const fetchAdminSites = async () => {
  return await Site.findAll({
    order: [["createdAt", "DESC"]],
  });
};

export const fetchAdminPlugins = async () => {
  return await (Plugin as any).findAll({
    order: [["createdAt", "DESC"]],
  });
};

export const fetchAdminActivityLogs = async () => {
  return await ActivityLog.findAll({
    limit: 50,
    order: [["createdAt", "DESC"]],
  });
};