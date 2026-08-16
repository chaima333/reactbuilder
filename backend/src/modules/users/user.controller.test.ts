import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createUser,
  getUsers,
  updateUser
} from "./user.controller";
import {
  ActivityLog,
  SiteMember,
  User
} from "../../models";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async () => "hashed-password")
  }
}));

vi.mock("../../models", () => ({
  ActivityLog: {
    create: vi.fn()
  },
  SiteMember: {
    sequelize: {
      fn: vi.fn((name, ...args) => ({
        name,
        args
      })),
      col: vi.fn((name) => ({
        col: name
      }))
    },
    findAll: vi.fn()
  },
  User: {
    create: vi.fn(),
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn()
  }
}));

const createResponse = () => {
  const res: any = {
    statusCode: 200,
    body: undefined,
    status: vi.fn((statusCode: number) => {
      res.statusCode = statusCode;
      return res;
    }),
    json: vi.fn((body: unknown) => {
      res.body = body;
      return res;
    })
  };

  return res;
};

const createUserModel = (
  values: Record<string, any>
) => ({
  ...values,
  get: vi.fn(() => ({
    ...values
  })),
  update: vi.fn(async function update(
    this: any,
    updateData: Record<string, any>
  ) {
    Object.assign(this, updateData);
    return this;
  })
});

describe("users controller admin projection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only approved active users and returns numeric siteCount", async () => {
    const user =
      createUserModel({
        id: 7,
        name: "Aza",
        email: "aza@example.com",
        role: "VIEWER",
        isApproved: true,
        password: "secret",
        twoFactorSecret: "hidden"
      });

    vi.mocked(User.findAll).mockResolvedValue([
      user
    ] as any);
    vi.mocked(SiteMember.findAll).mockResolvedValue([
      {
        userId: "7",
        siteCount: "2"
      }
    ] as any);

    const res = createResponse();

    await getUsers({} as any, res);

    expect(User.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isApproved: true
        }
      })
    );
    expect(res.body.data).toEqual([
      expect.objectContaining({
        id: 7,
        siteCount: 2,
        isApproved: true
      })
    ]);
    expect(res.body.data[0].password).toBeUndefined();
    expect(res.body.data[0].twoFactorSecret).toBeUndefined();
  });

  it("creates admin-created users as approved and validates platform roles", async () => {
    const created =
      createUserModel({
        id: 12,
        name: "New User",
        email: "new@example.com",
        role: "EDITOR",
        isApproved: true
      });

    vi.mocked(User.findOne).mockResolvedValue(
      null
    );
    vi.mocked(User.create).mockResolvedValue(
      created as any
    );

    const res = createResponse();

    await createUser(
      {
        body: {
          name: " New User ",
          email: "NEW@EXAMPLE.COM",
          password: "password",
          role: "editor"
        },
        user: {
          id: 1
        }
      } as any,
      res
    );

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New User",
        email: "new@example.com",
        role: "EDITOR",
        isApproved: true
      })
    );
    expect(ActivityLog.create).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body.data.isApproved).toBe(true);
  });

  it("rejects invalid roles on edit before mutating the user", async () => {
    const existing =
      createUserModel({
        id: 14,
        name: "Target",
        email: "target@example.com",
        role: "VIEWER"
      });

    vi.mocked(User.findByPk).mockResolvedValue(
      existing as any
    );

    const res = createResponse();

    await updateUser(
      {
        params: {
          id: "14"
        },
        body: {
          role: "OWNER"
        },
        user: {
          id: 1
        }
      } as any,
      res
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Rôle invalide"
    );
    expect(existing.update).not.toHaveBeenCalled();
  });
});
