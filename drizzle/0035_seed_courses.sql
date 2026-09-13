-- Initial course catalog seed. In its own migration file per the seed-data
-- rule (see CLAUDE.md and runbooks/database-migrations.md).
INSERT INTO courses (title, description, provider, duration_minutes)
VALUES
  ('Security and Compliance 101', 'SOC 2, data privacy, phishing prevention, and secure remote-work habits.', 'CircleWorks Academy', 45),
  ('Manager Foundations', 'The basics of coaching, one-on-ones, and giving feedback for new managers.', 'CircleWorks Academy', 90),
  ('Anti-Harassment Training', 'Federal + state-compliant harassment prevention training. Required annually.', 'CircleWorks Academy', 60),
  ('Effective 1:1 Meetings', 'Templates and rhythms for productive weekly one-on-ones between managers and reports.', 'CircleWorks Academy', 30),
  ('Data Privacy for Engineers', 'GDPR/CCPA fundamentals, PII handling, data-minimization patterns for engineering teams.', 'CircleWorks Academy', 60)
ON CONFLICT DO NOTHING;
