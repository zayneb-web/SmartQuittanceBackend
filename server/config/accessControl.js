import AccessControl from "accesscontrol";

const ac = new AccessControl();

ac.grant("AGENT")
  .read("own", "profile")
  .update("own", "profile")
  .read("own", "quittance")
  .create("quittance");

ac.grant("ADMIN_AGENCY")
  .extend("AGENT")
  .create("agent")
  .read("any", "agent")
  .update("any", "agent")
  .delete("agent")
  .read("any", "quittance");

ac.grant("FINANCE_COMPANY_MANAGER")
  .extend("AGENT")
  .read("own", "company")
  .read("any", "financial-data")
  .create("financial-report")
  .create("licence-request");

ac.grant("COMPANY_MANAGER")
  .extend("AGENT")
  .create("user")
  .read("own", "company")
  .update("own", "company")
  .validate("licence-request")
  .read("any", "licence-request");

ac.grant("ADMIN_ABSHORE")
  .extend(["COMPANY_MANAGER", "FINANCE_COMPANY_MANAGER"])
  .create("company")
  .read("any", "company")
  .update("any", "company")
  .create("company-manager")
  .create("finance-manager")
  .approve("licence-request")
  .read("any", "licence-request");

ac.grant("SUPER_ADMIN_ABSHORE")
  .extend("ADMIN_ABSHORE")
  .create("agency")
  .create("admin-abshore")
  .delete("any", "company")
  .delete("any", "user")
  .delete("any", "agency")
  .supervise("licence-request")
  .read("any", "licence-request");

export default ac;
