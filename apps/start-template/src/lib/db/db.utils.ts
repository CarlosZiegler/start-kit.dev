/** biome-ignore-all lint/style/useNamingConvention: <explanation> */
import {
  customType,
  uuid as drizzleUuid,
  timestamp,
} from "drizzle-orm/pg-core";
import { v7 } from "uuid";
export const uuid7 = v7;
export const uuid = (name = "id") =>
  drizzleUuid(name).$defaultFn(() => uuid7());
export const pk = (name = "id") => uuid(name).primaryKey();

export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return "tsvector";
  },
});
export const timeWithTimezone = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "date" }).defaultNow();

export const bytea = customType<{
  data: Buffer | null;
  notNull: false;
  default: false;
}>({
  dataType() {
    return "bytea";
  },
  toDriver(val: Buffer | null) {
    return val;
  },
  fromDriver(value: unknown) {
    if (value === null) {
      return null;
    }

    if (value instanceof Buffer) {
      return value;
    }

    if (typeof value === "string") {
      return Buffer.from(value, "hex");
    }

    throw new Error(`Unexpected type received from driver: ${typeof value}`);
  },
});

// Enums
export const ActionType = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
} as const;

export const ActorType = {
  SYSTEM: "system",
  MEMBER: "member",
  API: "api",
} as const;

export const ContactRecord = {
  PERSON: "person",
  COMPANY: "company",
} as const;

export const PersonType = {
  STUDENT: "student",
  STAFF: "staff", // For multiprofessional team members
  OTHER: "other", // For persons not affiliated with schools
} as const;

export const ContactStage = {
  INQUIRY: "inquiry", // Anfrage
  ACTIVE: "active", // Aktiv
  FORMER: "former", // Ehemalig
} as const;

export const ContactTaskStatus = {
  OPEN: "open",
  COMPLETED: "completed",
} as const;

export const DayOfWeek = {
  SUNDAY: "sunday",
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
} as const;

export const FeedbackCategory = {
  SUGGESTION: "suggestion",
  PROBLEM: "problem",
  QUESTION: "question",
} as const;

export const GroupType = {
  STAFF: "staff", // For teachers and other school staff
  STUDENT: "student", // For students
  GENERAL: "general", // For mixed/general purpose groups
} as const;

export const InvitationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REVOKED: "revoked",
} as const;

export const Role = {
  MEMBER: "member",
  ADMIN: "admin",
} as const;

export const WebhookTrigger = {
  CONTACT_CREATED: "contactCreated",
  CONTACT_UPDATED: "contactUpdated",
  CONTACT_DELETED: "contactDeleted",
} as const;

export function enumToPgEnum<T extends Record<string, string>>(myEnum: T) {
  return Object.values(myEnum).map((value) => `${value}`) as [
    T[keyof T],
    ...T[keyof T][],
  ];
}
