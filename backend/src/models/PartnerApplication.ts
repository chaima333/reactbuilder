import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import { Site } from "./site";

export type PartnerApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type PartnerSuggestedLevel =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM";

export type PartnerAvailability =
  | "AVAILABLE"
  | "PARTIAL"
  | "UNAVAILABLE";

@Table({
  tableName: "partner_applications",
  timestamps: true,
  underscored: true
})
export class PartnerApplication extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  declare id: number;

  @ForeignKey(() => Site)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "site_id"
  })
  declare siteId: number;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    field: "representative_full_name"
  })
  declare representativeFullName: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: "professional_email"
  })
  declare professionalEmail: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: false
  })
  declare phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare country: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  declare region?: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare city: string;

  @Column({
    type: DataType.STRING(180),
    allowNull: false,
    field: "company_name"
  })
  declare companyName: string;

  @Column({
    type: DataType.STRING(120),
    allowNull: true,
    field: "legal_identifier"
  })
  declare legalIdentifier?: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
    field: "expertise_sectors"
  })
  declare expertiseSectors: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare specializations: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "years_experience"
  })
  declare yearsExperience: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
    field: "certification_files"
  })
  declare certificationFiles: unknown[];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
    field: "portfolio_files"
  })
  declare portfolioFiles: unknown[];

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: "portfolio_text"
  })
  declare portfolioText: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: "client_references"
  })
  declare clientReferences?: string | null;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    defaultValue: "AVAILABLE"
  })
  declare availability: PartnerAvailability;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "current_workload"
  })
  declare currentWorkload?: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "daily_rate"
  })
  declare dailyRate?: number | null;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: []
  })
  declare languages: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
    field: "work_modes"
  })
  declare workModes: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: []
  })
  declare services: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: "company_logo_file"
  })
  declare companyLogoFile?: unknown | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: "accepted_terms"
  })
  declare acceptedTerms: boolean;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    defaultValue: "PENDING"
  })
  declare status: PartnerApplicationStatus;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    defaultValue: "BRONZE",
    field: "suggested_level"
  })
  declare suggestedLevel: PartnerSuggestedLevel;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: "reviewed_at"
  })
  declare reviewedAt?: Date | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "reviewed_by_user_id"
  })
  declare reviewedByUserId?: number | null;

  @BelongsTo(() => Site)
  declare site?: Site;
}