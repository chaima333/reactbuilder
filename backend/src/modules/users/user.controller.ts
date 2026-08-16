import { Response } from "express";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

import {
  ActivityLog,
  SiteMember,
  User
} from "../../models";
import { AuthRequest } from "../../shared/auth.util";

const PLATFORM_ROLES = [
  "ADMIN",
  "EDITOR",
  "VIEWER"
] as const;

type PlatformRole =
  typeof PLATFORM_ROLES[number];

const parseUserId = (
  rawId: string | string[] | undefined
) => {
  const value =
    Array.isArray(rawId)
      ? rawId[0]
      : rawId;

  const userId =
    Number(value);

  return Number.isInteger(userId) && userId > 0
    ? userId
    : null;
};

const normalizePlatformRole = (
  value: unknown
): PlatformRole | null => {
  if (typeof value !== "string") {
    return null;
  }

  const role =
    value.trim().toUpperCase();

  return PLATFORM_ROLES.includes(
    role as PlatformRole
  )
    ? (role as PlatformRole)
    : null;
};

const toUserAdminDTO = (
  user: User,
  siteCount = 0
) => {
  const raw =
    user.get({
      plain: true
    }) as Record<string, any>;

  delete raw.password;
  delete raw.resetPasswordToken;
  delete raw.resetPasswordExpires;
  delete raw.twoFactorSecret;

  return {
    ...raw,
    siteCount:
      Number(siteCount) || 0
  };
};

const getSiteCountsByUserId = async (
  userIds: number[]
) => {
  if (!userIds.length) {
    return new Map<number, number>();
  }

  const sequelize =
    SiteMember.sequelize;

  if (!sequelize) {
    throw new Error(
      "Sequelize instance missing"
    );
  }

  const rows =
    (await SiteMember.findAll({
      attributes: [
        [
          sequelize.col("user_id"),
          "userId"
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn(
              "DISTINCT",
              sequelize.col("site_id")
            )
          ),
          "siteCount"
        ]
      ],
      where: {
        userId: {
          [Op.in]: userIds
        }
      },
      group: [
        sequelize.col("user_id")
      ],
      raw: true
    })) as unknown as Array<{
      userId: number | string;
      siteCount: number | string;
    }>;

  return new Map(
    rows.map((row) => [
      Number(row.userId),
      Number(row.siteCount) || 0
    ])
  );
};

export const getUsers = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const users =
      await User.findAll({
        where: {
          isApproved: true
        },
        attributes: {
          exclude: [
            "password"
          ]
        },
        order: [
          [
            "createdAt",
            "DESC"
          ]
        ]
      });

    const siteCounts =
      await getSiteCountsByUserId(
        users.map((user) => user.id)
      );

    return res.json({
      success: true,
      data: users.map((user) =>
        toUserAdminDTO(
          user,
          siteCounts.get(user.id)
        )
      )
    });
  } catch (error) {
    console.error(
      "Get users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error:
        error instanceof Error
          ? error.message
          : String(error)
    });
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      parseUserId(req.params.id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID invalide"
      });
    }

    const user =
      await User.findByPk(userId, {
        attributes: {
          exclude: [
            "password"
          ]
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    const siteCounts =
      await getSiteCountsByUserId([
        user.id
      ]);

    return res.json({
      success: true,
      data: toUserAdminDTO(
        user,
        siteCounts.get(user.id)
      )
    });
  } catch (error) {
    console.error(
      "Get user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    const cleanName =
      typeof name === "string"
        ? name.trim()
        : "";

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (
      !cleanName ||
      !cleanEmail ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Nom, email et mot de passe sont requis"
      });
    }

    const normalizedRole =
      normalizePlatformRole(
        role || "VIEWER"
      );

    if (!normalizedRole) {
      return res.status(400).json({
        success: false,
        message: "Rôle invalide"
      });
    }

    const existingUser =
      await User.findOne({
        where: {
          email: cleanEmail
        }
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email déjà utilisé"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: normalizedRole,
        isApproved: true
      } as any);

    await ActivityLog.create({
      userId: req.user.id,
      action: "user_created",
      entityType: "user",
      entityId: user.id,
      details: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    } as any);

    return res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: toUserAdminDTO(user)
    });
  } catch (error) {
    console.error(
      "Create user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      parseUserId(req.params.id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID invalide"
      });
    }

    const user =
      await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    const updateData: Record<string, any> = {};
    const {
      name,
      email,
      role,
      password
    } = req.body;

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Nom requis"
        });
      }

      updateData.name =
        name.trim();
    }

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Email requis"
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      const existingUser =
        await User.findOne({
          where: {
            email: cleanEmail,
            id: {
              [Op.ne]: userId
            }
          }
        });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email déjà utilisé"
        });
      }

      updateData.email =
        cleanEmail;
    }

    if (role !== undefined) {
      const normalizedRole =
        normalizePlatformRole(role);

      if (!normalizedRole) {
        return res.status(400).json({
          success: false,
          message: "Rôle invalide"
        });
      }

      updateData.role =
        normalizedRole;
    }

    if (
      typeof password === "string" &&
      password.length > 0
    ) {
      updateData.password =
        await bcrypt.hash(
          password,
          10
        );
    }

    await user.update(updateData);

    await ActivityLog.create({
      userId: req.user.id,
      action: "user_updated",
      entityType: "user",
      entityId: user.id,
      details: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    } as any);

    const siteCounts =
      await getSiteCountsByUserId([
        user.id
      ]);

    return res.json({
      success: true,
      message: "Utilisateur mis à jour",
      data: toUserAdminDTO(
        user,
        siteCounts.get(user.id)
      )
    });
  } catch (error) {
    console.error(
      "Update user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      parseUserId(req.params.id);
    const currentUserId =
      req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID invalide"
      });
    }

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message:
          "Vous ne pouvez pas supprimer votre propre compte"
      });
    }

    const user =
      await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    const {
      Token,
      Page,
      Media
    } = require("../../models");

    await Token.destroy({
      where: {
        userId
      }
    });

    await Page.destroy({
      where: {
        userId
      }
    });

    await Media.destroy({
      where: {
        userId
      }
    });

    await ActivityLog.destroy({
      where: {
        userId
      }
    });

    await user.destroy();

    await ActivityLog.create({
      userId: currentUserId,
      action: "user_deleted",
      entityType: "user",
      entityId: user.id,
      details: {
        name: user.name,
        email: user.email
      }
    } as any);

    return res.json({
      success: true,
      message: "Utilisateur supprimé avec succès"
    });
  } catch (error) {
    console.error(
      "Delete user error DETAIL:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error:
        error instanceof Error
          ? error.message
          : String(error)
    });
  }
};

export const changeUserRole = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      parseUserId(req.params.id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID invalide"
      });
    }

    const role =
      normalizePlatformRole(
        req.body.role
      );

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Rôle invalide"
      });
    }

    const user =
      await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    const oldRole =
      user.role;

    await user.update({
      role
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: "user_role_changed",
      entityType: "user",
      entityId: user.id,
      details: {
        name: user.name,
        oldRole,
        newRole: role
      }
    } as any);

    return res.json({
      success: true,
      message: "Rôle mis à jour",
      data: toUserAdminDTO(user)
    });
  } catch (error) {
    console.error(
      "Change role error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};
