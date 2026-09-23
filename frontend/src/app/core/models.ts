export interface ServiceOffering {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlights: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source_name: string;
  source_url: string;
  region: string;
  published_at: string;
  tags: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_markdown: string;
  tags: string[];
  published_at: string;
  author_name: string;
  source_url: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export interface ConsultingRequestPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service_ids: string[];
  message: string;
}

export interface ConsultingRequestResponse {
  success: boolean;
  message: string;
  email_sent: boolean;
  email_error?: string | null;
}

export interface StudioApiBlock {
  type: 'text' | 'image';
  text?: string;
  name?: string;
  mime?: string;
  data_base64?: string;
}

export interface StudioIssuePayload {
  title: string;
  blocks: StudioApiBlock[];
}

export interface StudioIssueResponse {
  success: boolean;
  issue_url: string;
  issue_number: number;
  message: string;
}

export interface StudioStatusResponse {
  configured: boolean;
  missing: string[];
}

export interface StudioUnlockResponse {
  success: boolean;
  message: string;
}
