const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ProjectService = require('../services/task/ProjectService');
const SprintService = require('../services/task/SprintService');
const TaskService = require('../services/task/TaskService');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Project routes
router.post('/projects', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('project', req.body);
        const project = await ProjectService.createProject(validatedData, req.user.id);
        res.status(201).json({
            status: 'success',
            data: project
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create project' });
        next(error);
    }
});

router.get('/projects', auth.isAuthenticated, async (req, res, next) => {
    try {
        const projects = await ProjectService.listProjects(req.query);
        res.json({
            status: 'success',
            data: projects
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'List projects' });
        next(error);
    }
});

router.get('/projects/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const project = await ProjectService.getProject(req.params.id);
        res.json({
            status: 'success',
            data: project
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get project' });
        next(error);
    }
});

router.put('/projects/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('projectUpdate', req.body);
        const project = await ProjectService.updateProject(req.params.id, validatedData, req.user.id);
        res.json({
            status: 'success',
            data: project
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update project' });
        next(error);
    }
});

router.delete('/projects/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await ProjectService.deleteProject(req.params.id, req.user.id);
        res.json({
            status: 'success',
            message: 'Project deleted successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete project' });
        next(error);
    }
});

router.get('/projects/:id/metrics', auth.isAuthenticated, async (req, res, next) => {
    try {
        const metrics = await ProjectService.getProjectMetrics(req.params.id);
        res.json({
            status: 'success',
            data: metrics
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get project metrics' });
        next(error);
    }
});

// Sprint routes
router.post('/projects/:projectId/sprints', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('sprint', {
            ...req.body,
            project_id: req.params.projectId
        });
        const sprint = await SprintService.createSprint(validatedData, req.user.id);
        res.status(201).json({
            status: 'success',
            data: sprint
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create sprint' });
        next(error);
    }
});

router.get('/projects/:projectId/sprints', auth.isAuthenticated, async (req, res, next) => {
    try {
        const sprints = await SprintService.listSprints(req.params.projectId, req.query);
        res.json({
            status: 'success',
            data: sprints
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'List sprints' });
        next(error);
    }
});

router.get('/sprints/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const sprint = await SprintService.getSprint(req.params.id);
        res.json({
            status: 'success',
            data: sprint
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get sprint' });
        next(error);
    }
});

router.put('/sprints/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('sprintUpdate', req.body);
        const sprint = await SprintService.updateSprint(req.params.id, validatedData, req.user.id);
        res.json({
            status: 'success',
            data: sprint
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update sprint' });
        next(error);
    }
});

router.delete('/sprints/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await SprintService.deleteSprint(req.params.id, req.user.id);
        res.json({
            status: 'success',
            message: 'Sprint deleted successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete sprint' });
        next(error);
    }
});

router.get('/sprints/:id/metrics', auth.isAuthenticated, async (req, res, next) => {
    try {
        const metrics = await SprintService.getSprintMetrics(req.params.id);
        res.json({
            status: 'success',
            data: metrics
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get sprint metrics' });
        next(error);
    }
});

// Task routes
router.post('/projects/:projectId/tasks', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('task', {
            ...req.body,
            project_id: req.params.projectId
        });
        const task = await TaskService.createTask(validatedData, req.user.id);
        res.status(201).json({
            status: 'success',
            data: task
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create task' });
        next(error);
    }
});

router.get('/tasks', auth.isAuthenticated, async (req, res, next) => {
    try {
        const tasks = await TaskService.listTasks(req.query);
        res.json({
            status: 'success',
            data: tasks
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'List tasks' });
        next(error);
    }
});

router.get('/tasks/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const task = await TaskService.getTask(req.params.id);
        res.json({
            status: 'success',
            data: task
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get task' });
        next(error);
    }
});

router.put('/tasks/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('taskUpdate', req.body);
        const task = await TaskService.updateTask(req.params.id, validatedData, req.user.id);
        res.json({
            status: 'success',
            data: task
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update task' });
        next(error);
    }
});

router.delete('/tasks/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await TaskService.deleteTask(req.params.id, req.user.id);
        res.json({
            status: 'success',
            message: 'Task deleted successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete task' });
        next(error);
    }
});

// Task comments
router.post('/tasks/:id/comments', auth.isAuthenticated, async (req, res, next) => {
    try {
        const comment = await TaskService.addComment(
            req.params.id,
            req.body.content,
            req.user.id
        );
        res.status(201).json({
            status: 'success',
            data: comment
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add task comment' });
        next(error);
    }
});

// Task attachments
router.post('/tasks/:id/attachments', auth.isAuthenticated, async (req, res, next) => {
    try {
        const attachment = await TaskService.addAttachment(
            req.params.id,
            req.body,
            req.user.id
        );
        res.status(201).json({
            status: 'success',
            data: attachment
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add task attachment' });
        next(error);
    }
});

// Task time logging
router.post('/tasks/:id/time-logs', auth.isAuthenticated, async (req, res, next) => {
    try {
        const timeLog = await TaskService.logTime(
            req.params.id,
            req.body,
            req.user.id
        );
        res.status(201).json({
            status: 'success',
            data: timeLog
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Log task time' });
        next(error);
    }
});

// Task labels
router.post('/tasks/:id/labels/:labelId', auth.isAuthenticated, async (req, res, next) => {
    try {
        const task = await TaskService.addLabel(
            req.params.id,
            req.params.labelId,
            req.user.id
        );
        res.json({
            status: 'success',
            data: task
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add task label' });
        next(error);
    }
});

router.delete('/tasks/:id/labels/:labelId', auth.isAuthenticated, async (req, res, next) => {
    try {
        const task = await TaskService.removeLabel(
            req.params.id,
            req.params.labelId,
            req.user.id
        );
        res.json({
            status: 'success',
            data: task
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Remove task label' });
        next(error);
    }
});

// Task watchers
router.post('/tasks/:id/watchers/:userId', auth.isAuthenticated, async (req, res, next) => {
    try {
        const task = await TaskService.addWatcher(
            req.params.id,
            req.params.userId,
            req.user.id
        );
        res.json({
            status: 'success',
            data: task
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add task watcher' });
        next(error);
    }
});

router.delete('/tasks/:id/watchers/:userId', auth.isAuthenticated, async (req, res, next) => {
    try {
        const task = await TaskService.removeWatcher(
            req.params.id,
            req.params.userId,
            req.user.id
        );
        res.json({
            status: 'success',
            data: task
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Remove task watcher' });
        next(error);
    }
});

// Task history
router.get('/tasks/:id/history', auth.isAuthenticated, async (req, res, next) => {
    try {
        const history = await TaskService.getTaskHistory(req.params.id);
        res.json({
            status: 'success',
            data: history
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get task history' });
        next(error);
    }
});

// Task metrics
router.get('/tasks/:id/metrics', auth.isAuthenticated, async (req, res, next) => {
    try {
        const metrics = await TaskService.getTaskMetrics(req.params.id);
        res.json({
            status: 'success',
            data: metrics
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get task metrics' });
        next(error);
    }
});

module.exports = router;