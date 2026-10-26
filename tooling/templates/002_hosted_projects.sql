CREATE TABLE hosted_projects (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  input jsonb NOT NULL,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  application_uuid text,
  deployment_uuid text,
  submitted_at timestamptz,
  case_study_id uuid REFERENCES records(id),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
