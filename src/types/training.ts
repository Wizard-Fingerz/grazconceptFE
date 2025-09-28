// Training & Resource Center TypeScript Interfaces

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number; // in seconds
  category: TrainingCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  created_at: string;
  updated_at: string;
  instructor: string;
  views: number;
  likes: number;
  is_featured: boolean;
  is_required: boolean;
  prerequisites?: string[];
  learning_objectives: string[];
  resources?: TrainingResource[];
}

export interface TrainingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parent_id?: string;
  sort_order: number;
}

export interface TrainingProgress {
  id: string;
  user_id: number;
  tutorial_id: string;
  progress_percentage: number;
  time_watched: number; // in seconds
  completed: boolean;
  completed_at?: string;
  last_watched_at: string;
  notes?: string;
  rating?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: string;
  content: string;
  variables: TemplateVariable[];
  created_at: string;
  updated_at: string;
  created_by: number;
  is_public: boolean;
  usage_count: number;
  tags: string[];
  file_url?: string;
  file_type?: string;
  file_size?: number;
}

export type TemplateType = 
  | 'email'
  | 'document'
  | 'proposal'
  | 'contract'
  | 'invoice'
  | 'report'
  | 'presentation'
  | 'script'
  | 'checklist'
  | 'form';

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'select';
  required: boolean;
  default_value?: string;
  options?: string[];
  description?: string;
}

export interface DigitalCatalog {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  file_url: string;
  file_type: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx';
  file_size: number;
  thumbnail_url?: string;
  version: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  is_active: boolean;
  download_count: number;
  tags: string[];
  pages?: number;
  language: string;
  target_audience: 'agents' | 'customers' | 'both';
}

export interface SalesScript {
  id: string;
  title: string;
  description: string;
  category: ScriptCategory;
  scenario: string;
  script_content: string;
  key_points: string[];
  objections: ObjectionResponse[];
  follow_up_actions: string[];
  created_at: string;
  updated_at: string;
  created_by: number;
  is_active: boolean;
  usage_count: number;
  success_rate: number;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number; // in minutes
}

export type ScriptCategory = 
  | 'cold_calling'
  | 'follow_up'
  | 'objection_handling'
  | 'closing'
  | 'customer_service'
  | 'product_demo'
  | 'consultation'
  | 'renewal'
  | 'upselling'
  | 'crisis_management';

export interface ObjectionResponse {
  objection: string;
  response: string;
  tips: string[];
}

export interface AgentPlaybook {
  id: string;
  title: string;
  description: string;
  category: PlaybookCategory;
  content: string;
  sections: PlaybookSection[];
  created_at: string;
  updated_at: string;
  created_by: number;
  is_active: boolean;
  version: string;
  tags: string[];
  target_roles: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type PlaybookCategory = 
  | 'onboarding'
  | 'procedures'
  | 'policies'
  | 'best_practices'
  | 'troubleshooting'
  | 'compliance'
  | 'product_knowledge'
  | 'customer_service'
  | 'sales_techniques'
  | 'emergency_protocols';

export interface PlaybookSection {
  id: string;
  title: string;
  content: string;
  order: number;
  subsections?: PlaybookSubsection[];
}

export interface PlaybookSubsection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface TrainingResource {
  id: string;
  name: string;
  type: 'document' | 'link' | 'video' | 'audio' | 'image';
  url?: string;
  file_url?: string;
  description?: string;
}

export interface TrainingStats {
  total_tutorials: number;
  completed_tutorials: number;
  completion_rate: number;
  total_time_watched: number;
  average_rating: number;
  favorite_category: string;
  recent_activity: TrainingActivity[];
  achievements: Achievement[];
}

export interface TrainingActivity {
  id: string;
  user_id: number;
  type: 'video_watched' | 'template_used' | 'script_used' | 'catalog_downloaded' | 'playbook_viewed';
  resource_id: string;
  resource_name: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  unlocked_at: string;
  points: number;
}

export interface TrainingFilter {
  active?: boolean;
  target_audience?: 'agents' | 'customers' | 'both';
  category?: string;
  difficulty?: string;
  type?: string;
  search?: string;
  tags?: string[];
  is_featured?: boolean;
  is_required?: boolean;
  public_only?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface TrainingSort {
  field: 'title' | 'created_at' | 'views' | 'likes' | 'duration' | 'difficulty';
  direction: 'asc' | 'desc';
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  tutorials: string[]; // tutorial IDs
  estimated_duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learning_objectives: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  completion_criteria: string;
  certificate_required: boolean;
}
