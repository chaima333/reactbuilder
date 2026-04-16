import { User, ActivityLog } from '../../models';
import { Op } from 'sequelize';

export const fetchPendingUsers = async (adminId: number) => {
  return await User.findAll({
    where: {
      isApproved: false,
      id: { [Op.not]: adminId }
    },
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']]
  });
};

export const approveUserById = async (userId: number, adminId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Utilisateur non trouvé');

  await user.update({ isApproved: true });

  await ActivityLog.create({
    userId: adminId,
    action: 'user_approved',
    entityType: 'user',
    entityId: user.id,
    details: { name: user.name, email: user.email }
  } as any);

  return user;
};

export const deleteUserById = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Utilisateur non trouvé');

  await user.destroy();
  return true;
};