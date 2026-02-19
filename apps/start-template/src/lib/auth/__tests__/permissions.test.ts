import { describe, expect, it } from "vitest";

import {
  canAssignRole,
  canDeleteInvitations,
  canDeleteOrganization,
  canInviteMembers,
  canManageInvitations,
  canManageOrganization,
  canRemoveMembers,
  canUpdateMemberRoles,
} from "@/lib/auth/permissions";

describe("role assignment behavior", () => {
  it("owner can assign any role", () => {
    expect(canAssignRole("owner", "owner")).toBe(true);
    expect(canAssignRole("owner", "admin")).toBe(true);
    expect(canAssignRole("owner", "user")).toBe(true);
  });

  it("admin can assign user and admin roles", () => {
    expect(canAssignRole("admin", "admin")).toBe(true);
    expect(canAssignRole("admin", "user")).toBe(true);
    expect(canAssignRole("admin", "owner")).toBe(false);
  });

  it("user can only assign user role", () => {
    expect(canAssignRole("user", "user")).toBe(true);
    expect(canAssignRole("user", "admin")).toBe(false);
    expect(canAssignRole("user", "owner")).toBe(false);
  });
});

describe("organization management behavior", () => {
  it("owner can manage organization", () => {
    expect(canManageOrganization("owner")).toBe(true);
  });

  it("admin can manage organization", () => {
    expect(canManageOrganization("admin")).toBe(true);
  });

  it("member cannot manage organization", () => {
    expect(canManageOrganization("member")).toBe(false);
  });
});

describe("organization deletion behavior", () => {
  it("only owner can delete organization", () => {
    expect(canDeleteOrganization("owner")).toBe(true);
    expect(canDeleteOrganization("admin")).toBe(false);
    expect(canDeleteOrganization("member")).toBe(false);
  });
});

describe("member invitation behavior", () => {
  it("owner can invite members", () => {
    expect(canInviteMembers("owner")).toBe(true);
  });

  it("admin can invite members", () => {
    expect(canInviteMembers("admin")).toBe(true);
  });

  it("member cannot invite others", () => {
    expect(canInviteMembers("member")).toBe(false);
  });
});

describe("member removal behavior", () => {
  it("owner can remove members", () => {
    expect(canRemoveMembers("owner")).toBe(true);
  });

  it("admin can remove members", () => {
    expect(canRemoveMembers("admin")).toBe(true);
  });

  it("member cannot remove others", () => {
    expect(canRemoveMembers("member")).toBe(false);
  });
});

describe("role update behavior", () => {
  it("owner can update member roles", () => {
    expect(canUpdateMemberRoles("owner")).toBe(true);
  });

  it("admin can update member roles", () => {
    expect(canUpdateMemberRoles("admin")).toBe(true);
  });

  it("member cannot update roles", () => {
    expect(canUpdateMemberRoles("member")).toBe(false);
  });
});

describe("invitation management behavior", () => {
  it("owner can manage invitations", () => {
    expect(canManageInvitations("owner")).toBe(true);
  });

  it("admin can manage invitations", () => {
    expect(canManageInvitations("admin")).toBe(true);
  });

  it("member cannot manage invitations", () => {
    expect(canManageInvitations("member")).toBe(false);
  });
});

describe("invitation deletion behavior", () => {
  it("owner can delete invitations", () => {
    expect(canDeleteInvitations("owner")).toBe(true);
  });

  it("admin can delete invitations", () => {
    expect(canDeleteInvitations("admin")).toBe(true);
  });

  it("member cannot delete invitations", () => {
    expect(canDeleteInvitations("member")).toBe(false);
  });
});
