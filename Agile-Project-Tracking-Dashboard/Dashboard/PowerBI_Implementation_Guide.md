# Power BI Implementation Guide

## 1. Import Dataset

1. Open Power BI Desktop.
2. Select **Get Data > Excel Workbook**.
3. Import `Dataset/agile_project_tracking_dataset.xlsx`.
4. Load the `Agile Tasks` sheet.
5. Rename the table to `Agile Tasks`.

## 2. Data Type Setup

Set the following columns:

| Column | Data Type |
|---|---|
| Task ID | Text |
| Epic | Text |
| Sprint Name | Text |
| Team Member | Text |
| Priority | Text |
| Story Points | Whole Number |
| Task Status | Text |
| Start Date | Date |
| Due Date | Date |
| Completion Date | Date |
| Department | Text |
| Risk Level | Text |
| Estimated Hours | Whole Number |
| Actual Hours | Whole Number |
| Delay Reason | Text |
| Sprint Start Date | Date |
| Sprint End Date | Date |
| Cycle Time Days | Whole Number |
| Is Overdue | Text |
| Completed Flag | Whole Number |

## 3. Recommended Data Model

For a portfolio version, a single-table model is acceptable because the dataset is generated for dashboard demonstration. For a more advanced version, create dimension tables:

- `DimSprint` from Sprint Name, Sprint Start Date, Sprint End Date
- `DimTeamMember` from Team Member and Department
- `DimStatus` from Task Status
- `DimDate` using a calendar table

## 4. DAX Measures

Copy the measures from `Dashboard/DAX_Measures.dax` into Power BI. Create a display folder called `KPI Measures` for cleaner organization.

Recommended formatting:

- Completion and utilization measures: Percentage, 1 decimal place
- Cycle time: Decimal number, 1 decimal place
- Counts and story points: Whole number
- Productivity and health scores: Decimal number, 1 decimal place

## 5. Dashboard Pages

### Page 1: Executive Overview

Purpose: Stakeholder reporting and overall Agile delivery monitoring.

Recommended visuals:

- KPI cards: Total Tasks, Completed Tasks, Pending Tasks, Sprint Completion Rate, Average Cycle Time, Team Utilization %
- Donut chart: Task Status distribution
- Bar chart: Tasks by Priority
- Line chart: Completed tasks by Sprint Name
- Slicers: Sprint Name, Department, Priority, Risk Level

### Page 2: Sprint Analysis

Purpose: Sprint planning, sprint review, backlog tracking, and delivery trend analysis.

Recommended visuals:

- Clustered column chart: Planned vs Completed Story Points by Sprint Name
- Line chart: Remaining Story Points by Sprint Name as a burndown-style trend
- Matrix: Sprint Name, Total Tasks, Completed Tasks, Sprint Completion Rate, Sprint Health Score
- Bar chart: Sprint-wise performance by Completion Rate
- Slicers: Sprint Name, Epic, Priority

### Page 3: Team Performance

Purpose: Resource utilization and workload visibility for project coordination.

Recommended visuals:

- Bar chart: Total Tasks by Team Member
- Stacked bar chart: Task Status by Team Member
- Column chart: Actual Hours and Estimated Hours by Team Member
- Table: Team Member, Completed Tasks, Average Cycle Time, Resource Utilization %, Team Productivity Score
- Slicers: Department, Sprint Name, Task Status

### Page 4: Project Health

Purpose: Risk monitoring, bottleneck identification, and workflow optimization.

Recommended visuals:

- KPI cards: Overdue Tasks, High-Risk Tasks, Testing Bottleneck Tasks, Delivery Variance %
- Bar chart: Delay Reason count
- Matrix: Epic, Risk Level, Overdue Tasks, High-Risk Tasks
- Funnel or stacked bar: Task Status bottleneck analysis
- Scatter chart: Estimated Hours vs Actual Hours by Epic or Team Member
- Slicers: Risk Level, Delay Reason, Department

## 6. Visual Theme

Use a professional Jira-inspired palette:

- Dark navy: `#172B4D`
- Atlassian blue: `#0052CC`
- Cyan accent: `#00B8D9`
- Success green: `#36B37E`
- Warning yellow: `#FFAB00`
- Risk red: `#DE350B`
- Background: `#F4F5F7`

## 7. Power BI Publishing Steps

1. Save the report as `Dashboard/Agile_Project_Tracking_Dashboard.pbix`.
2. Export screenshots of all four pages into the `Images` folder.
3. Publish to Power BI Service if available.
4. Add the report link to `README.md`.

## 8. Portfolio Positioning

This project can be described as:

> A Jira-inspired Agile Project Tracking Dashboard using Power BI and Excel to monitor sprint delivery, backlog progress, team utilization, task completion, risks, and project health KPIs for Scrum and operations reporting.
