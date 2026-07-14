import {
  Request,
  Response
} from "express";

import {
  FormsService
} from "./forms.service";

const getSiteId = (
  req: Request
) =>
  Number(
    req.params.siteId
  );

const getFormId = (
  req: Request
) =>
  Number(
    req.params.formId
  );

const getSubmissionId = (
  req: Request
) =>
  Number(
    req.params.submissionId
  );

export class FormsController {
  static async getForms(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const data =
        await FormsService.getForms(
          siteId
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load forms"
      });
    }
  }

  static async getFormById(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const formId =
        getFormId(req);

      const data =
        await FormsService.getFormById(
          siteId,
          formId
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      if (
        error.message ===
        "FORM_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Form not found"
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load form"
      });
    }
  }

  static async createForm(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const data =
        await FormsService.createForm(
          siteId,
          req.body || {}
        );

      return res.status(201).json({
        success: true,
        data
      });
    } catch (error: any) {
      if (
        error.message ===
          "FORM_NAME_REQUIRED" ||
        error.message ===
          "FORM_SLUG_REQUIRED"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (
        error.message ===
        "FORM_SLUG_EXISTS"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Form slug already exists"
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create form"
      });
    }
  }

  static async updateForm(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const formId =
        getFormId(req);

      const data =
        await FormsService.updateForm(
          siteId,
          formId,
          req.body || {}
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      if (
        error.message ===
        "FORM_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Form not found"
        });
      }

      if (
        error.message ===
        "FORM_SLUG_EXISTS"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Form slug already exists"
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to update form"
      });
    }
  }

  static async deleteForm(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const formId =
        getFormId(req);

      await FormsService.deleteForm(
        siteId,
        formId
      );

      return res.json({
        success: true,
        data: true
      });
    } catch (error: any) {
      if (
        error.message ===
        "FORM_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Form not found"
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete form"
      });
    }
  }

  static async getSubmissions(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const formId =
        getFormId(req);

      const data =
        await FormsService.getSubmissions(
          siteId,
          formId
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      if (
        error.message ===
        "FORM_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Form not found"
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load submissions"
      });
    }
  }

  static async updateSubmissionStatus(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const formId =
        getFormId(req);

      const submissionId =
        getSubmissionId(req);

      if (
        !siteId ||
        !formId ||
        !submissionId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid site, form or submission ID"
        });
      }

      const data =
        await FormsService
          .updateSubmissionStatus(
            siteId,
            formId,
            submissionId,
            req.body?.status
          );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      if (
        error.message ===
        "SUBMISSION_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found"
        });
      }

      if (
        error.message ===
        "INVALID_SUBMISSION_STATUS"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be new, read, archived or spam"
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update submission"
      });
    }
  }

  static async deleteSubmission(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const formId =
        getFormId(req);

      const submissionId =
        getSubmissionId(req);

      if (
        !siteId ||
        !formId ||
        !submissionId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid site, form or submission ID"
        });
      }

      await FormsService
        .deleteSubmission(
          siteId,
          formId,
          submissionId
        );

      return res.json({
        success: true,
        data: true
      });
    } catch (error: any) {
      if (
        error.message ===
        "SUBMISSION_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found"
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete submission"
      });
    }
  }

  static async getFormBySlug(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        getSiteId(req);

      const {
        slug
      } = req.params;

      const data =
        await FormsService.getFormBySlug(
          siteId,
          slug
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      if (
        error.message ===
        "FORM_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Form not found"
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load form"
      });
    }
  }
}