import {
  PartnerApplication,
  type PartnerSuggestedLevel
} from "../../models/PartnerApplication";

import type {
  CreatePartnerApplicationInput
} from "./partnerApplication.validation";

type ServiceError =
  Error & {
    status?: number;
  };

const createServiceError = (
  message: string,
  status: number
): ServiceError => {
  const error =
    new Error(message) as ServiceError;

  error.status = status;

  return error;
};

const normalizeOptionalText = (
  value?: string | null
): string | null => {
  if (!value) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
};

const normalizeEmail = (
  email: string
): string =>
  email
    .trim()
    .toLowerCase();

const getSuggestedLevel = (
  yearsExperience: number
): PartnerSuggestedLevel => {
  if (yearsExperience >= 10) {
    return "PLATINUM";
  }

  if (yearsExperience >= 5) {
    return "GOLD";
  }

  if (yearsExperience >= 2) {
    return "SILVER";
  }

  return "BRONZE";
};

const getApplicationByIdOrThrow = async (
  siteId: number,
  applicationId: number
) => {
  const application =
    await PartnerApplication.findOne({
      where: {
        id: applicationId,
        siteId
      }
    });

  if (!application) {
    throw createServiceError(
      "Partner application not found",
      404
    );
  }

  return application;
};

export const partnerApplicationService = {
  async createApplication(
    siteId: number,
    data: CreatePartnerApplicationInput
  ) {
    const professionalEmail =
      normalizeEmail(
        data.professionalEmail
      );

    const existingApplication =
      await PartnerApplication.findOne({
        where: {
          siteId,
          professionalEmail
        }
      });

    if (existingApplication) {
      throw createServiceError(
        "A partner application already exists for this email",
        409
      );
    }

    return PartnerApplication.create({
      siteId,

      representativeFullName:
        data.representativeFullName,

      professionalEmail,

      phone:
        data.phone,

      country:
        data.country,

      region:
        normalizeOptionalText(
          data.region
        ),

      city:
        data.city,

      companyName:
        data.companyName,

      legalIdentifier:
        normalizeOptionalText(
          data.legalIdentifier
        ),

      expertiseSectors:
        data.expertiseSectors,

      specializations:
        data.specializations,

      yearsExperience:
        data.yearsExperience,

      certificationFiles:
        data.certificationFiles,

      portfolioFiles:
        data.portfolioFiles,

      portfolioText:
        data.portfolioText,

      clientReferences:
        normalizeOptionalText(
          data.clientReferences
        ),

      availability:
        data.availability,

      currentWorkload:
        data.currentWorkload ?? null,

      dailyRate:
        data.dailyRate ?? null,

      languages:
        data.languages,

      workModes:
        data.workModes,

      services:
        data.services,

      companyLogoFile:
        data.companyLogoFile ?? null,

      acceptedTerms:
        data.acceptedTerms,

      status:
        "PENDING",

      suggestedLevel:
        getSuggestedLevel(
          data.yearsExperience
        )
    });
  },

  async listApplications(
    siteId: number
  ) {
    return PartnerApplication.findAll({
      where: {
        siteId
      },
      order: [
        ["createdAt", "DESC"]
      ]
    });
  },

  async getApplicationById(
    siteId: number,
    applicationId: number
  ) {
    return getApplicationByIdOrThrow(
      siteId,
      applicationId
    );
  },

  async approveApplication(
    siteId: number,
    applicationId: number,
    reviewedByUserId: number
  ) {
    const application =
      await getApplicationByIdOrThrow(
        siteId,
        applicationId
      );

    if (
      application.status === "APPROVED"
    ) {
      return application;
    }

    await application.update({
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedByUserId
    });

    return application;
  },

  async rejectApplication(
    siteId: number,
    applicationId: number,
    reviewedByUserId: number
  ) {
    const application =
      await getApplicationByIdOrThrow(
        siteId,
        applicationId
      );

    if (
      application.status === "REJECTED"
    ) {
      return application;
    }

    await application.update({
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedByUserId
    });

    return application;
  }
};