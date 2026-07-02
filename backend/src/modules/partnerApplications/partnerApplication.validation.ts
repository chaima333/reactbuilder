import { z } from "zod";

export const availabilityValues = [
  "AVAILABLE",
  "PARTIAL",
  "UNAVAILABLE"
] as const;

export const statusValues = [
  "PENDING",
  "APPROVED",
  "REJECTED"
] as const;

export const suggestedLevelValues = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM"
] as const;

const requiredStringArraySchema =
  z
    .array(
      z
        .string()
        .trim()
        .min(1)
    )
    .min(1);

const optionalTextSchema =
  z
    .string()
    .trim()
    .optional()
    .nullable();

const optionalNumberSchema =
  z
    .coerce
    .number()
    .int()
    .min(0)
    .optional()
    .nullable();

const fileMetadataSchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(1),

    url:
      z
        .string()
        .trim()
        .min(1)
        .optional()
        .nullable(),

    type:
      z
        .string()
        .trim()
        .optional()
        .nullable(),

    size:
      z
        .coerce
        .number()
        .int()
        .min(0)
        .optional()
        .nullable()
  });

export const createPartnerApplicationSchema =
  z.object({
    representativeFullName:
      z
        .string()
        .trim()
        .min(
          3,
          "Representative full name must contain at least 3 characters"
        )
        .max(150),

    professionalEmail:
      z
        .string()
        .trim()
        .email("Invalid professional email")
        .max(255)
        .toLowerCase(),

    phone:
      z
        .string()
        .trim()
        .regex(
          /^\+[1-9]\d{7,14}$/,
          "Phone must use international format, example: +216XXXXXXXX"
        ),

    country:
      z
        .string()
        .trim()
        .min(2)
        .max(100),

    region:
      optionalTextSchema,

    city:
      z
        .string()
        .trim()
        .min(2)
        .max(100),

    companyName:
      z
        .string()
        .trim()
        .min(2)
        .max(180),

    legalIdentifier:
      optionalTextSchema,

    expertiseSectors:
      requiredStringArraySchema,

    specializations:
      z
        .string()
        .trim()
        .min(
          2,
          "Specializations are required"
        ),

    yearsExperience:
      z
        .coerce
        .number()
        .int()
        .min(1),

    certificationFiles:
      z
        .array(fileMetadataSchema)
        .min(
          1,
          "At least one certification file is required"
        ),

    portfolioFiles:
      z
        .array(fileMetadataSchema)
        .min(
          1,
          "At least one portfolio file is required"
        ),

    portfolioText:
      z
        .string()
        .trim()
        .min(
          10,
          "Portfolio description is required"
        ),

    clientReferences:
      optionalTextSchema,

    availability:
      z.enum(availabilityValues),

    currentWorkload:
      optionalNumberSchema,

    dailyRate:
      optionalNumberSchema,

    languages:
      requiredStringArraySchema,

    workModes:
      requiredStringArraySchema,

    services:
      requiredStringArraySchema,

    companyLogoFile:
      fileMetadataSchema
        .optional()
        .nullable(),

   acceptedTerms:
  z.literal(
    true,
    {
      message:
        "Terms and collaboration contract must be accepted"
    }
  )
  });

export type CreatePartnerApplicationInput =
  z.infer<
    typeof createPartnerApplicationSchema
  >;