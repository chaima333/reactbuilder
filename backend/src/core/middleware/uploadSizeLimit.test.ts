import type {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from "express";

import multer from "multer";

import {
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createSingleFileUploadHandler,
  HTML_ZIP_UPLOAD_MAX_BYTES,
  MEDIA_UPLOAD_MAX_BYTES
} from "./uploadSizeLimit";

const makeResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  };

  response.status.mockReturnValue(
    response
  );

  response.json.mockReturnValue(
    response
  );

  return response;
};

const makeUploader = (
  error?: unknown
) => {
  const middleware:
    RequestHandler =
      (
        _req: Request,
        _res: Response,
        next: NextFunction
      ) => {
        next(error);
      };

  const single =
    vi.fn(
      (
        _fieldName: string
      ) => middleware
    );

  return {
    uploader: {
      single
    },

    single
  };
};

const makeHandler = (
  uploader:
    ReturnType<
      typeof makeUploader
    >["uploader"]
) =>
  createSingleFileUploadHandler({
    upload:
      uploader,

    fieldName:
      "file",

    tooLargeCode:
      "TEST_FILE_TOO_LARGE",

    tooLargeMessage:
      "The file is too large.",

    invalidUploadCode:
      "TEST_UPLOAD_INVALID"
  });

describe(
  "upload size limits",
  () => {
    it(
      "defines media and HTML ZIP size limits",
      () => {
        expect(
          MEDIA_UPLOAD_MAX_BYTES
        ).toBe(
          10 * 1024 * 1024
        );

        expect(
          HTML_ZIP_UPLOAD_MAX_BYTES
        ).toBe(
          50 * 1024 * 1024
        );
      }
    );

    it(
      "runs the upload middleware",
      () => {
        const upload =
          makeUploader();

        const handler =
          makeHandler(
            upload.uploader
          );

        const res =
          makeResponse();

        const next =
          vi.fn();

        handler(
          {} as Request,
          res as unknown as Response,
          next
        );

        expect(
          upload.single
        ).toHaveBeenCalledWith(
          "file"
        );

        expect(
          next
        ).toHaveBeenCalledOnce();

        expect(
          res.status
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "returns 413 when a file is too large",
      () => {
        const error =
          new multer.MulterError(
            "LIMIT_FILE_SIZE",
            "file"
          );

        const upload =
          makeUploader(error);

        const handler =
          makeHandler(
            upload.uploader
          );

        const res =
          makeResponse();

        const next =
          vi.fn();

        handler(
          {} as Request,
          res as unknown as Response,
          next
        );

        expect(
          res.status
        ).toHaveBeenCalledWith(
          413
        );

        expect(
          res.json
        ).toHaveBeenCalledWith({
          success: false,
          message:
            "The file is too large.",
          code:
            "TEST_FILE_TOO_LARGE"
        });

        expect(
          next
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "returns 400 for other Multer errors",
      () => {
        const error =
          new multer.MulterError(
            "LIMIT_UNEXPECTED_FILE",
            "wrongField"
          );

        const upload =
          makeUploader(error);

        const handler =
          makeHandler(
            upload.uploader
          );

        const res =
          makeResponse();

        const next =
          vi.fn();

        handler(
          {} as Request,
          res as unknown as Response,
          next
        );

        expect(
          res.status
        ).toHaveBeenCalledWith(
          400
        );

        expect(
          res.json
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            code:
              "TEST_UPLOAD_INVALID"
          })
        );

        expect(
          next
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "forwards unknown upload errors",
      () => {
        const error =
          new Error(
            "Storage unavailable"
          );

        const upload =
          makeUploader(error);

        const handler =
          makeHandler(
            upload.uploader
          );

        const res =
          makeResponse();

        const next =
          vi.fn();

        handler(
          {} as Request,
          res as unknown as Response,
          next
        );

        expect(
          next
        ).toHaveBeenCalledWith(
          error
        );

        expect(
          res.status
        ).not.toHaveBeenCalled();
      }
    );
  }
);