import AccessControl from "accesscontrol";

const ac = new AccessControl();

ac.grant("AGENT")
  .readOwn("profile")
  .updateOwn("profile")
  .readOwn("quittance")
  .createOwn("quittance");

ac.grant("ADMIN_AGENCY")
  .extend("AGENT")
  .createAny("agent")
  .readAny("agent")
  .updateAny("agent")
  .deleteAny("agent")
  .readAny("quittance");

ac.grant("FINANCE_COMPANY_MANAGER")
  .extend("AGENT")
  .readOwn("company")
  .readAny("financial-data")
  .createOwn("financial-report")
  .createOwn("licence-request");

ac.grant("COMPANY_MANAGER")
  .extend("AGENT")
  .createAny("user")
  .createOwn("amdin-agency")
  .createAny("agency")
  .readOwn("company")
  .readAny("agency")
  .readAny("finance-company-manager")
  .readOwn("agency-manager")
  .readAny("admin-agency")
  .readOwn("agent")
  .updateOwn("company")
  .updateAny("licence-request")
  .readAny("licence-request");

ac.grant("ADMIN_ABSHORE")
  .extend(["COMPANY_MANAGER", "FINANCE_COMPANY_MANAGER"])
  .createAny("company")
  .readAny("company")
  .updateAny("company")
  .createAny("company-manager")
  .createAny("finance-manager")
  .updateAny("licence-request")
  .readAny("licence-request")
  .readOwn("profile")
  .updateOwn("profile")
  .readAny("admin-abshore")
  .readAny("company-manager")
  .readAny("finance-manager");

ac.grant("SUPER_ADMIN_ABSHORE")
  .extend("ADMIN_ABSHORE")
  .createAny("agency")
  .createAny("admin-abshore")
  .deleteAny("company")
  .deleteAny("user")
  .deleteAny("agency")
  .updateAny("licence-request")
  .readAny("licence-request")
  .readAny("user");

export default ac;
