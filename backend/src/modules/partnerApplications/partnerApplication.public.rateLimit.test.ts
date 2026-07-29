import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createPublicPartnerApplicationLimiter
} from "./partnerApplication.public.rateLimit";

type MockResponse = {
  statusCode: number;
  body: unknown;
  headersSent: boolean;
  setHeader: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const makeRequest = (
  overrides: {
    ip?: string;
    siteId?: string;
  } = {}
) => {
  const ip =
    overrides.ip || "203.0.113.10";

  return {
    ip,
    originalUrl:
      "/api/public/sites/10/partner-applications",
    headers: {},
    socket: {
      remoteAddress: ip
    },
    params: {
      siteId:
        overrides.siteId || "10"
    }
  };
};

const makeResponse = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 200,
    body: null,
    headersSent: false,
    setHeader: vi.fn(),
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((body: unknown) => {
      res.body = body;
      res.headersSent = true;
      return res;
    })
  };

  return res;
};

const callLimiter = async (
  limiter: ReturnType<typeof createPublicPartnerApplicationLimiter>,
  requestOverrides: Parameters<typeof makeRequest>[0] = {}
) => {
  const req =
    makeRequest(requestOverrides);

  const res =
    makeResponse();

  const next =
    vi.fn();

  await limiter(
    req as never,
    res as never,
    next
  );

  return {
    res,
    next
  };
};

describe("public partner application rate limiter", () => {
  let limiter:
    ReturnType<typeof createPublicPartnerApplicationLimiter>;

  beforeEach(() => {
    limiter =
      createPublicPartnerApplicationLimiter();
  });

  it("allows requests 1 through 5 and rate-limits request 6", async () => {
    for (let index = 0; index < 5; index += 1) {
      const result =
        await callLimiter(limiter);

      expect(result.next).toHaveBeenCalledOnce();
      expect(result.res.status).not.toHaveBeenCalledWith(429);
    }

    const limited =
      await callLimiter(limiter);

    expect(limited.next).not.toHaveBeenCalled();
    expect(limited.res.status).toHaveBeenCalledWith(429);
    expect(limited.res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: "PARTNER_APPLICATION_RATE_LIMITED"
      })
    );
  });

  it("uses a separate bucket for a different siteId", async () => {
    for (let index = 0; index < 5; index += 1) {
      await callLimiter(limiter, {
        siteId: "10"
      });
    }

    const result =
      await callLimiter(limiter, {
        siteId: "11"
      });

    expect(result.next).toHaveBeenCalledOnce();
    expect(result.res.status).not.toHaveBeenCalledWith(429);
  });

  it("uses a separate bucket for a different client IP", async () => {
    for (let index = 0; index < 5; index += 1) {
      await callLimiter(limiter, {
        ip: "203.0.113.10"
      });
    }

    const result =
      await callLimiter(limiter, {
        ip: "203.0.113.11"
      });

    expect(result.next).toHaveBeenCalledOnce();
    expect(result.res.status).not.toHaveBeenCalledWith(429);
  });
});
