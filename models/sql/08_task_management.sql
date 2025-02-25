-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(code),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    goal TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'planned',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Task types
CREATE TABLE IF NOT EXISTS task_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert default task types
-- INSERT INTO task_types (name, description, icon, color, created_by) VALUES 
-- ('Story', 'User story representing a feature', 'bookmark', '#36B37E', 1),
-- ('Bug', 'Software defect that needs to be fixed', 'bug_report', '#FF5630', 1),
-- ('Task', 'General task or sub-task', 'assignment', '#4C9AFF', 1),
-- ('Epic', 'Large body of work that can be broken down', 'timeline', '#904EE2', 1);

-- Task priorities
CREATE TABLE IF NOT EXISTS task_priorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

-- Insert default priorities
-- INSERT INTO task_priorities (name, description, level, icon, color) VALUES 
-- ('Highest', 'Critical priority tasks', 5, 'arrow_upward', '#FF5630'),
-- ('High', 'Important tasks', 4, 'arrow_upward', '#FF7452'),
-- ('Medium', 'Normal priority tasks', 3, 'remove', '#FFC400'),
-- ('Low', 'Tasks that can wait', 2, 'arrow_downward', '#4C9AFF'),
-- ('Lowest', 'Optional tasks', 1, 'arrow_downward', '#6B778C');

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INTEGER NOT NULL,
    sprint_id INTEGER,
    parent_task_id INTEGER,
    type_id INTEGER NOT NULL,
    priority_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo',
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2) DEFAULT 0,
    due_date DATE,
    assigned_to INTEGER,
    reporter INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    FOREIGN KEY (type_id) REFERENCES task_types(id),
    FOREIGN KEY (priority_id) REFERENCES task_priorities(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (reporter) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Task labels
CREATE TABLE IF NOT EXISTS task_labels (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    project_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE INDEX idx_project_label (project_id, name)
);

-- Task label assignments
CREATE TABLE IF NOT EXISTS task_label_assignments (
    task_id INTEGER NOT NULL,
    label_id INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, label_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (label_id) REFERENCES task_labels(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Task comments
CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    task_id INTEGER NOT NULL,
    parent_comment_id INTEGER,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (parent_comment_id) REFERENCES task_comments(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_comment_task (task_id)
);

-- Task attachments
CREATE TABLE IF NOT EXISTS task_attachments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    task_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_attachment_task (task_id)
);

-- Task time logs
CREATE TABLE IF NOT EXISTS task_time_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    description TEXT,
    logged_date DATE NOT NULL,
    hours_spent DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_time_log_task (task_id),
    INDEX idx_time_log_user (user_id),
    INDEX idx_time_log_date (logged_date)
);

-- Task status history
CREATE TABLE IF NOT EXISTS task_status_history (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    task_id INTEGER NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_status_history_task (task_id)
);

-- Task assignment history
CREATE TABLE IF NOT EXISTS task_assignment_history (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    task_id INTEGER NOT NULL,
    old_assignee INTEGER,
    new_assignee INTEGER,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (old_assignee) REFERENCES users(id),
    FOREIGN KEY (new_assignee) REFERENCES users(id),
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_assignment_history_task (task_id)
);

-- Task relationships
CREATE TABLE IF NOT EXISTS task_relationships (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    source_task_id INTEGER NOT NULL,
    target_task_id INTEGER NOT NULL,
    relationship_type ENUM('blocks', 'is_blocked_by', 'relates_to', 'duplicates', 'is_duplicated_by') NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_task_id) REFERENCES tasks(id),
    FOREIGN KEY (target_task_id) REFERENCES tasks(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE INDEX idx_unique_relationship (source_task_id, target_task_id, relationship_type)
);

-- Task audit logs
CREATE TABLE IF NOT EXISTS task_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Task templates
CREATE TABLE IF NOT EXISTS task_templates (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    project_id INTEGER,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type_id INTEGER NOT NULL,
    priority_id INTEGER NOT NULL,
    estimated_hours DECIMAL(5,2),
    checklist_items JSON,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (type_id) REFERENCES task_types(id),
    FOREIGN KEY (priority_id) REFERENCES task_priorities(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Task watchers
CREATE TABLE IF NOT EXISTS task_watchers (
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    added_by INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (added_by) REFERENCES users(id)
);

-- Task metrics
CREATE TABLE IF NOT EXISTS task_metrics (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    task_id INTEGER NOT NULL,
    time_in_todo INT DEFAULT 0,
    time_in_progress INT DEFAULT 0,
    time_in_review INT DEFAULT 0,
    cycle_time INT DEFAULT 0,
    lead_time INT DEFAULT 0,
    number_of_comments INT DEFAULT 0,
    number_of_attachments INT DEFAULT 0,
    number_of_revisions INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    INDEX idx_metrics_task (task_id)
);

-- Create indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_task_time_logs_task_id ON task_time_logs(task_id);
CREATE INDEX idx_task_time_logs_user_id ON task_time_logs(user_id);
CREATE INDEX idx_task_status_history_task_id ON task_status_history(task_id);
CREATE INDEX idx_task_assignment_history_task_id ON task_assignment_history(task_id);
CREATE INDEX idx_task_audit_logs_entity ON task_audit_logs(entity_type, entity_id);
CREATE INDEX idx_task_audit_logs_created_at ON task_audit_logs(created_at);