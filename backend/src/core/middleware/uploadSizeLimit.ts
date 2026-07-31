import type {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from "express";

import multer from "multer";

export const MEDIA_UPLOAD_MAX_BYTES =
  10 * 1024 * 1024;

export const HTML_ZIP_UPLOAD_MAX_BYTES =
  50 * 1024 * 1024;

type SingleFileUploader = {
  single:
    (
      fieldName: string
    ) => RequestHandler;
};

type SingleFileUploadHandlerOptions = {
  upload: SingleFileUploader;
  fieldName: string;
  tooLargeCode: string;
  tooLargeMessage: string;
  invalidUploadCode: string;
};

export const createSingleFileUploadHandler = (
  options: SingleFileUploadHandlerOptions
): RequestHandler => {
  const uploadSingleFile =
    options.upload.single(
      options.fieldName
    );

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    uploadSingleFile(
      req,
      res,
      error => {
        if (!error) {
          next();
          return;
        }

        if (
          error instanceof
            multer.MulterError &&
          error.code ===
            "LIMIT_FILE_SIZE"
        ) {
          res.status(413).json({
            success: false,
            message:
              options.tooLargeMessage,
            code:
              options.tooLargeCode
          });

          return;
        }

        if (
          error instanceof
            multer.MulterError
        ) {
          res.status(400).json({
            success: false,
            message:
              error.message,
            code:
              options.invalidUploadCode
          });

          return;
        }

        next(error);
      }
    );
  };
};