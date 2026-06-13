"""
Generate a realistic Agile project tracking dataset for a portfolio dashboard.

Outputs:
- Dataset/agile_project_tracking_dataset.xlsx
- Dataset/agile_project_tracking_dataset.csv

The dataset is intentionally Jira-inspired and contains sprint, backlog,
delivery, workload, utilization, and project-health fields suitable for Power BI.
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd


SEED = 42
RECORD_COUNT = 620

ROOT_DIR = Path(__file__).resolve().parents[1]
DATASET_DIR = ROOT_DIR / "Dataset"
OUTPUT_XLSX = DATASET_DIR / "agile_project_tracking_dataset.xlsx"
OUTPUT_CSV = DATASET_DIR / "agile_project_tracking_dataset.csv"


EPICS = [
    "Customer Onboarding Automation",
    "Sprint Reporting Hub",
    "Mobile Experience Improvements",
    "Billing Workflow Optimization",
    "Data Quality Remediation",
    "Stakeholder Notification Service",
    "Backlog Prioritization Framework",
    "Operations SLA Dashboard",
    "API Reliability Upgrade",
    "User Access Governance",
]

TEAM_MEMBERS = [
    "Aarav Mehta",
    "Ananya Rao",
    "Dev Patel",
    "Isha Sharma",
    "Kabir Khan",
    "Meera Nair",
    "Neha Verma",
    "Rohan Gupta",
    "Sara Thomas",
    "Vikram Singh",
    "Zoya Fernandes",
    "Arjun Menon",
]

DEPARTMENTS = [
    "Product",
    "Engineering",
    "QA",
    "Operations",
    "Customer Success",
    "Data Analytics",
]

PRIORITIES = ["Low", "Medium", "High", "Critical"]
PRIORITY_WEIGHTS = [0.18, 0.44, 0.28, 0.10]

RISK_LEVELS = ["Low", "Medium", "High"]
RISK_WEIGHTS = [0.48, 0.34, 0.18]

STATUSES = ["To Do", "In Progress", "Testing", "Done"]

DELAY_REASONS = [
    "None",
    "Dependency Blocker",
    "Scope Clarification",
    "Resource Constraint",
    "UAT Feedback",
    "Environment Issue",
    "Requirement Change",
]


def sprint_calendar() -> list[dict[str, object]]:
    start = datetime(2025, 1, 6)
    sprints = []
    for index in range(1, 13):
        sprint_start = start + timedelta(days=(index - 1) * 14)
        sprint_end = sprint_start + timedelta(days=13)
        sprints.append(
            {
                "Sprint Name": f"Sprint {index:02d} - 2025",
                "Sprint Start": sprint_start,
                "Sprint End": sprint_end,
            }
        )
    return sprints


def choose_status(sprint_end: datetime) -> str:
    today = datetime(2025, 7, 15)
    if sprint_end < today - timedelta(days=30):
        return random.choices(STATUSES, weights=[0.06, 0.09, 0.10, 0.75])[0]
    if sprint_end < today:
        return random.choices(STATUSES, weights=[0.12, 0.20, 0.18, 0.50])[0]
    return random.choices(STATUSES, weights=[0.34, 0.32, 0.18, 0.16])[0]


def estimate_hours(story_points: int, risk_level: str, priority: str) -> int:
    base = story_points * random.uniform(3.2, 5.8)
    risk_factor = {"Low": 1.0, "Medium": 1.15, "High": 1.32}[risk_level]
    priority_factor = {"Low": 0.95, "Medium": 1.0, "High": 1.10, "Critical": 1.22}[priority]
    return max(4, int(round(base * risk_factor * priority_factor)))


def actual_hours(estimated: int, status: str, risk_level: str) -> int:
    if status == "To Do":
        return 0
    completion_factor = {
        "In Progress": random.uniform(0.35, 0.78),
        "Testing": random.uniform(0.72, 1.08),
        "Done": random.uniform(0.82, 1.28),
    }[status]
    risk_factor = {"Low": 0.98, "Medium": 1.08, "High": 1.22}[risk_level]
    return max(1, int(round(estimated * completion_factor * risk_factor)))


def main() -> None:
    random.seed(SEED)
    np.random.seed(SEED)
    DATASET_DIR.mkdir(parents=True, exist_ok=True)

    sprints = sprint_calendar()
    rows = []
    story_point_options = [1, 2, 3, 5, 8, 13]
    story_point_weights = [0.10, 0.16, 0.28, 0.25, 0.16, 0.05]

    for task_num in range(1, RECORD_COUNT + 1):
        sprint = random.choice(sprints)
        sprint_start = sprint["Sprint Start"]
        sprint_end = sprint["Sprint End"]
        priority = random.choices(PRIORITIES, weights=PRIORITY_WEIGHTS)[0]
        risk_level = random.choices(RISK_LEVELS, weights=RISK_WEIGHTS)[0]
        status = choose_status(sprint_end)
        story_points = random.choices(story_point_options, weights=story_point_weights)[0]

        start_offset = random.randint(0, 8)
        start_date = sprint_start + timedelta(days=start_offset)
        due_date = min(start_date + timedelta(days=random.randint(3, 12)), sprint_end + timedelta(days=5))

        if status == "Done":
            delay_bias = {"Low": 0, "Medium": random.randint(0, 3), "High": random.randint(1, 7)}[risk_level]
            completion_date = due_date + timedelta(days=random.choices([-2, -1, 0, 1, 2, delay_bias], [0.08, 0.12, 0.34, 0.18, 0.16, 0.12])[0])
            completion_date = max(completion_date, start_date + timedelta(days=1))
        else:
            completion_date = pd.NaT

        estimated = estimate_hours(story_points, risk_level, priority)
        actual = actual_hours(estimated, status, risk_level)
        is_overdue = status != "Done" and due_date < datetime(2025, 7, 15)
        if status == "Done" and pd.notna(completion_date):
            is_overdue = completion_date > due_date

        if not is_overdue:
            delay_reason = "None"
        else:
            delay_reason = random.choices(DELAY_REASONS[1:], weights=[0.24, 0.17, 0.18, 0.13, 0.12, 0.16])[0]

        rows.append(
            {
                "Task ID": f"APT-{task_num:04d}",
                "Epic": random.choice(EPICS),
                "Sprint Name": sprint["Sprint Name"],
                "Team Member": random.choice(TEAM_MEMBERS),
                "Priority": priority,
                "Story Points": story_points,
                "Task Status": status,
                "Start Date": start_date.date(),
                "Due Date": due_date.date(),
                "Completion Date": completion_date.date() if pd.notna(completion_date) else pd.NaT,
                "Department": random.choice(DEPARTMENTS),
                "Risk Level": risk_level,
                "Estimated Hours": estimated,
                "Actual Hours": actual,
                "Delay Reason": delay_reason,
                "Sprint Start Date": sprint_start.date(),
                "Sprint End Date": sprint_end.date(),
            }
        )

    df = pd.DataFrame(rows)
    df["Cycle Time Days"] = (
        pd.to_datetime(df["Completion Date"]) - pd.to_datetime(df["Start Date"])
    ).dt.days
    df["Cycle Time Days"] = df["Cycle Time Days"].fillna(0).astype(int)
    df["Is Overdue"] = np.where(
        (df["Task Status"] != "Done") & (pd.to_datetime(df["Due Date"]) < datetime(2025, 7, 15)),
        "Yes",
        np.where(
            (df["Task Status"] == "Done") & (pd.to_datetime(df["Completion Date"]) > pd.to_datetime(df["Due Date"])),
            "Yes",
            "No",
        ),
    )
    df["Completed Flag"] = np.where(df["Task Status"] == "Done", 1, 0)

    df.to_csv(OUTPUT_CSV, index=False)

    with pd.ExcelWriter(OUTPUT_XLSX, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Agile Tasks", index=False)

        summary = pd.DataFrame(
            {
                "Metric": [
                    "Total Tasks",
                    "Completed Tasks",
                    "Pending Tasks",
                    "Completion Rate",
                    "Average Cycle Time",
                    "Overdue Tasks",
                    "High Risk Tasks",
                ],
                "Value": [
                    len(df),
                    int(df["Completed Flag"].sum()),
                    int((df["Task Status"] != "Done").sum()),
                    round(float(df["Completed Flag"].mean()), 4),
                    round(float(df.loc[df["Task Status"] == "Done", "Cycle Time Days"].mean()), 2),
                    int((df["Is Overdue"] == "Yes").sum()),
                    int((df["Risk Level"] == "High").sum()),
                ],
            }
        )
        summary.to_excel(writer, sheet_name="Dataset Summary", index=False)

        workbook = writer.book
        for sheet_name in ["Agile Tasks", "Dataset Summary"]:
            worksheet = workbook[sheet_name]
            worksheet.freeze_panes = "A2"
            for column_cells in worksheet.columns:
                max_length = max(len(str(cell.value)) if cell.value is not None else 0 for cell in column_cells)
                worksheet.column_dimensions[column_cells[0].column_letter].width = min(max(max_length + 2, 12), 32)

    print(f"Generated {len(df)} records")
    print(f"Excel: {OUTPUT_XLSX}")
    print(f"CSV: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
