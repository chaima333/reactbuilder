import { z } from "zod";

const emailSchema =
  z
    .string()
    .trim()
    .email("Invalid email address")
    .max(
      255,
      "Email cannot exceed 255 characters"
    )
    .transform((value) =>
      value.toLowerCase()
    );

const passwordSchema =
  z
    .string()
    .min(
      8,
      "Password must contain at least 8 characters"
    )
    .max(
      72,
      "Password cannot exceed 72 characters"
    );

export const registerSiteVisitorSchema =
  z
    .object({
      fullName: z
        .string()
        .trim()
        .min(
          2,
          "Full name must contain at least 2 characters"
        )
        .max(
          150,
          "Full name cannot exceed 150 characters"
        ),

      email:
        emailSchema,

      password:
        passwordSchema
          .regex(
            /[a-z]/,
            "Password must contain a lowercase letter"
          )
          .regex(
            /[A-Z]/,
            "Password must contain an uppercase letter"
          )
          .regex(
            /\d/,
            "Password must contain a number"
          )
          .regex(
            /[^A-Za-z0-9]/,
            "Password must contain a special character"
          )
    })
    .strict();

export const loginSiteVisitorSchema =
  z
    .object({
      email:
        emailSchema,

      password:
        passwordSchema
    })
    .strict();
export const refreshSiteVisitorSchema =
  z
    .object({
      refreshToken: z
        .string()
        .trim()
        .min(
          40,
          "Refresh token is required"
        )
        .max(
          200,
          "Invalid refresh token"
        )
    })
    .strict();
export type RegisterSiteVisitorInput =
  z.infer<
    typeof registerSiteVisitorSchema
  >;

export type LoginSiteVisitorInput =
  z.infer<
    typeof loginSiteVisitorSchema
  >;

export type RefreshSiteVisitorInput =
  z.infer<
    typeof refreshSiteVisitorSchema
  >;
