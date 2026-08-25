export interface LoginConfig {
  route: string;
  usernameSelector: string;
  passwordSelector: string;
  submitSelector: string;
  username: string;
  password: string;
}

export interface AuthenticatedFlow {
  name: string;
  login: LoginConfig;
  steps: string[];
}

export interface AuditSiteConfig {
  baseUrl: string;
  routes?: string[];
  authenticatedFlows?: AuthenticatedFlow[];
  includeW3c?: boolean;
  /** Guid público do projeto na API Argos */
  projectId?: string;
}

export type AuditStepKind = "public" | "flow-login" | "flow-post-login";

export interface PlannedAuditTarget {
  path: string;
  fullUrl: string;
  flowName?: string;
  kind: AuditStepKind;
  label: string;
}
