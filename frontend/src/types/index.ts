export type ContactStatus = 'READY' | 'INVALID' | 'SENT' | 'FAILED' | 'UNSUBSCRIBED';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  status: ContactStatus;
  invalidReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  name?: string;
  email: string;
  company?: string;
  position?: string;
  status?: ContactStatus;
}

export interface InvalidRow {
  rowNumber: number;
  name?: string;
  email?: string;
  company?: string;
  position?: string;
  reason: string;
}

export interface ImportSummary {
  totalRows: number;
  importedCount: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  invalidRows: InvalidRow[];
}

export interface ImportPreviewResponse {
  headers: string[];
  suggestedMapping: Record<string, string>;
  previewRows: Record<string, string>[];
  totalEstimatedRows: number;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Attachment {
  id: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRequest {
  name: string;
  subject: string;
  body: string;
  attachmentIds?: string[];
}

export interface TemplatePreviewRequest {
  contactId?: string;
  customName?: string;
  customEmail?: string;
  customCompany?: string;
  customPosition?: string;
}

export interface TemplatePreviewResponse {
  toEmail: string;
  toName: string;
  company: string;
  position: string;
  subject: string;
  body: string;
  isPreviewMode: boolean;
}

export interface CampaignRecent {
  id: string;
  name: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  successRate: number;
  status: CampaignStatus;
  createdAt: string;
  completedAt?: string | null;
}


export interface SocialLink {
  id?: string;
  name: string;
  url: string;
}

export interface UserSettings {
  maxEmailsPerCampaign: number;
  sendingDelayMs: number;
  defaultTemplateId?: string | null;
  socialLinks?: SocialLink[];
}

export interface DashboardStats {
  totalContacts: number;
  contactsReady: number;
  totalTemplates: number;
  totalCampaigns: number;
  activeCampaigns: number;
  emailsSent: number;
  emailsFailed: number;
  successRate: number;
  recentCampaigns?: CampaignRecent[];
}

export interface GmailConnectionDto {
  connected: boolean;
  googleAccountEmail?: string;
  connectedAt?: string;
  tokenExpired?: boolean;
}

export type CampaignStatus = 'DRAFT' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PAUSED' | 'FAILED';

export type CampaignRecipientStatus = 'PENDING' | 'SENDING' | 'SENT' | 'FAILED' | 'SKIPPED';

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  status: CampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  attachments?: Attachment[];
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  contactId: string;
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
  contactPosition?: string;
  status: CampaignRecipientStatus;
  sentAt?: string | null;
  errorMessage?: string | null;
}

export interface CampaignDetail {
  campaign: Campaign;
  recipients: CampaignRecipient[];
}

export interface CreateCampaignRequest {
  name: string;
  templateId: string;
  contactIds?: string[];
  attachmentIds?: string[];
}

export interface DuplicateCheckResponse {
  duplicateCount: number;
  duplicateContactIds: string[];
  warningMessage?: string | null;
}

export interface PreflightCheckResponse {
  readyToSend: boolean;
  gmailConnected: boolean;
  gmailAccountEmail?: string | null;
  totalRecipients: number;
  willSendCount: number;
  skippedCount: number;
  invalidEmailsCount: number;
  unsubscribedCount: number;
  duplicateCount: number;
  eligibleContactIds: string[];
  skippedReasons: string[];
  validationErrors: string[];
}
