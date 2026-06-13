# Agile Project Tracking Dashboard - Project Documentation

## Business Problem Statement

Agile teams often manage sprint planning, backlog tracking, task assignment, and project delivery across multiple tools. When sprint progress, overdue tasks, resource utilization, and delivery risks are not visible in one place, project coordinators and Scrum teams struggle to identify blockers early, communicate reliable status updates, and support stakeholder reporting.

This project solves that problem by creating a Jira-inspired Agile Project Tracking Dashboard that converts task-level sprint data into actionable Power BI insights for Scrum, project coordination, operations, and business analysis use cases.

## Project Objectives

- Track sprint delivery progress across Agile teams.
- Monitor task completion, pending work, and overdue items.
- Analyze story points completed versus planned.
- Identify workload imbalance across team members.
- Measure estimated hours versus actual hours for utilization tracking.
- Highlight high-risk tasks, bottlenecks, and delay reasons.
- Support stakeholder reporting through executive KPIs and project health views.

## Dataset Overview

The generated Excel dataset contains 620 realistic task records across 12 sprints. Each task includes sprint, epic, team member, priority, story points, task status, dates, department, risk level, estimated hours, actual hours, delay reason, and derived project health fields.

Required dataset fields included:

- Task ID
- Epic
- Sprint Name
- Team Member
- Priority
- Story Points
- Task Status
- Start Date
- Due Date
- Completion Date
- Department
- Risk Level
- Estimated Hours
- Actual Hours

Additional fields were added to improve analysis:

- Delay Reason
- Sprint Start Date
- Sprint End Date
- Cycle Time Days
- Is Overdue
- Completed Flag

## Dashboard Pages

### Executive Overview

Focuses on high-level KPI monitoring for stakeholders:

- Total Tasks
- Completed Tasks
- Pending Tasks
- Sprint Completion %
- Average Cycle Time
- Team Utilization %

### Sprint Analysis

Supports sprint planning, sprint review, and backlog tracking:

- Sprint progress
- Story points completed
- Burndown-style remaining story point trend
- Sprint-wise performance comparison

### Team Performance

Helps project coordinators and Scrum Masters understand workload and resource allocation:

- Team member workload
- Task distribution by status
- Completion rate
- Resource utilization
- Productivity score

### Project Health

Highlights operational risks and delivery blockers:

- Overdue tasks
- High-risk tasks
- Bottleneck analysis
- Delay reasons
- Estimated versus actual hour variance

## Key Insights

- Sprint-level completion rates help identify whether teams are consistently delivering committed backlog items.
- Overdue tasks are concentrated in higher-risk work, showing the need for earlier dependency tracking.
- Testing and in-progress task counts can reveal workflow bottlenecks before sprint closure.
- Actual hours versus estimated hours provides a useful signal for planning accuracy and resource utilization.
- Team-level completion and productivity scores help balance workload during sprint planning.

## Business Recommendations

- Use sprint completion rate and story point completion rate during sprint reviews to improve estimation accuracy.
- Review high-risk tasks during daily stand-ups so blockers are surfaced early.
- Track delay reasons weekly to identify recurring process issues such as dependency blockers or requirement changes.
- Use team utilization metrics to redistribute work before individual contributors become overloaded.
- Monitor overdue tasks by epic to prioritize stakeholder communication and corrective action.
- Add Power BI alerts for high-risk overdue tasks when publishing to Power BI Service.

## Tools Used

- Microsoft Excel for structured dataset storage.
- Python for dataset generation script.
- Node.js fallback generator for environments where Python is unavailable.
- Power BI for dashboard development.
- DAX for KPI measures.
- GitHub for portfolio presentation and project versioning.

## Target Resume Roles

This project is designed for final-year engineering students applying for:

- Scrum Intern
- Project Coordinator Intern
- Operations Intern
- Business Analyst Intern

## Resume Bullet

Developed a Jira-inspired Agile Project Tracking Dashboard using Excel, Power BI, and DAX to monitor sprint progress, backlog status, task completion, resource utilization, project risks, and stakeholder reporting KPIs across 620 simulated Agile task records.
