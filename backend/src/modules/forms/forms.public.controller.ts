import {
  Request,
  Response
} from "express";

import {
  FormsService
} from "./forms.service";

export class FormsPublicController {
  static async getFormById(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        Number(req.params.siteId);

      const formId =
        Number(req.params.formId);

      if (!siteId || !formId) {
        return res.status(400).json({
          success: false,
          message:
            "siteId and formId are required"
        });
      }

      const form =
        await FormsService
          .getPublicFormById(
            siteId,
            formId
          );

      return res.json({
        success: true,
        data: {
          id: form.id,
          siteId: form.siteId,
          pageId: form.pageId,
          name: form.name,
          slug: form.slug,

          schema:
            Array.isArray(form.schema)
              ? form.schema
              : [],

          settings:
            form.settings || {},

          isActive:
            form.isActive
        }
      });
    } catch (error: any) {
      const message =
        String(
          error?.message || ""
        );

      if (
        message === "FORM_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Form not found or inactive"
        });
      }

      console.error(
        "PUBLIC_FORM_LOAD_ERROR",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load form"
      });
    }
  }

  static async submitForm(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        Number(req.params.siteId);

      const formId =
        Number(req.params.formId);

      if (!siteId || !formId) {
        return res.status(400).json({
          success: false,
          message:
            "siteId and formId are required"
        });
      }

      const data =
        await FormsService.submitForm(
          siteId,
          formId,
          {
            values:
              req.body?.values || {},

            pageId:
              req.body?.pageId !== undefined
                ? Number(req.body.pageId)
                : null,

            ipAddress:
              req.ip || null,

            userAgent:
              req.get("user-agent") ||
              null
          }
        );

      return res.status(201).json({
        success: true,
        data: {
          id: data.id,
          status: data.status
        }
      });
    } catch (error: any) {
      const message =
        String(
          error?.message || ""
        );

      if (
        message === "FORM_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Form not found or inactive"
        });
      }

      if (
        message.startsWith(
          "REQUIRED_FIELD_MISSING:"
        ) ||
        message.startsWith(
          "INVALID_EMAIL:"
        )
      ) {
        return res.status(400).json({
          success: false,
          message
        });
      }

      console.error(
        "PUBLIC_FORM_SUBMIT_ERROR",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to submit form"
      });
    }
  }
}