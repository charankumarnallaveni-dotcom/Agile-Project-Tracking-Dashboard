import fs from "node:fs/promises";

const RECORD_COUNT = 620;
const rootDir = new URL("../", import.meta.url);
const datasetDir = new URL("Dataset/", rootDir);
const outputXlsx = new URL("Dataset/agile_project_tracking_dataset.xlsx", rootDir);
const outputCsv = new URL("Dataset/agile_project_tracking_dataset.csv", rootDir);

const epics = [
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
];

const teamMembers = [
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
];

const departments = ["Product", "Engineering", "QA", "Operations", "Customer Success", "Data Analytics"];
const priorities = ["Low", "Medium", "High", "Critical"];
const priorityWeights = [0.18, 0.44, 0.28, 0.1];
const riskLevels = ["Low", "Medium", "High"];
const riskWeights = [0.48, 0.34, 0.18];
const statuses = ["To Do", "In Progress", "Testing", "Done"];
const delayReasons = [
  "Dependency Blocker",
  "Scope Clarification",
  "Resource Constraint",
  "UAT Feedback",
  "Environment Issue",
  "Requirement Change",
];

let seed = 42;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function weightedChoice(items, weights) {
  const roll = random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i += 1) {
    cumulative += weights[i];
    if (roll <= cumulative) return items[i];
  }
  return items.at(-1);
}

function choice(items) {
  return items[Math.floor(random() * items.length)];
}

function randInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function sprintCalendar() {
  const start = new Date("2025-01-06T00:00:00");
  return Array.from({ length: 12 }, (_, index) => {
    const sprintStart = addDays(start, index * 14);
    return {
      "Sprint Name": `Sprint ${String(index + 1).padStart(2, "0")} - 2025`,
      "Sprint Start": sprintStart,
      "Sprint End": addDays(sprintStart, 13),
    };
  });
}

function chooseStatus(sprintEnd) {
  const today = new Date("2025-07-15T00:00:00");
  if (sprintEnd < addDays(today, -30)) return weightedChoice(statuses, [0.06, 0.09, 0.1, 0.75]);
  if (sprintEnd < today) return weightedChoice(statuses, [0.12, 0.2, 0.18, 0.5]);
  return weightedChoice(statuses, [0.34, 0.32, 0.18, 0.16]);
}

function estimateHours(storyPoints, riskLevel, priority) {
  const riskFactor = { Low: 1, Medium: 1.15, High: 1.32 }[riskLevel];
  const priorityFactor = { Low: 0.95, Medium: 1, High: 1.1, Critical: 1.22 }[priority];
  return Math.max(4, Math.round(storyPoints * (3.2 + random() * 2.6) * riskFactor * priorityFactor));
}

function actualHours(estimated, status, riskLevel) {
  if (status === "To Do") return 0;
  const factors = {
    "In Progress": 0.35 + random() * 0.43,
    Testing: 0.72 + random() * 0.36,
    Done: 0.82 + random() * 0.46,
  };
  const riskFactor = { Low: 0.98, Medium: 1.08, High: 1.22 }[riskLevel];
  return Math.max(1, Math.round(estimated * factors[status] * riskFactor));
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function cellRef(row, col) {
  let n = col;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return `${letters}${row}`;
}

function xmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  return {
    dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    dosDate: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

async function writeZip(files, targetUrl) {
  const chunks = [];
  const centralDirectory = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  for (const file of files) {
    const nameBuffer = Buffer.from(file.path, "utf8");
    const dataBuffer = Buffer.from(file.content, "utf8");
    const crc = crc32(dataBuffer);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(dataBuffer.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    chunks.push(localHeader, nameBuffer, dataBuffer);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(dataBuffer.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralDirectory.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + dataBuffer.length;
  }

  const centralStart = offset;
  const centralBuffer = Buffer.concat(centralDirectory);
  chunks.push(centralBuffer);

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(centralStart, 16);
  end.writeUInt16LE(0, 20);
  chunks.push(end);

  await fs.writeFile(targetUrl, Buffer.concat(chunks));
}

function sheetXml(headers, dataRows) {
  const headerXml = headers
    .map((header, index) => `<c r="${cellRef(1, index + 1)}" t="inlineStr" s="1"><is><t>${xmlEscape(header)}</t></is></c>`)
    .join("");
  const bodyXml = dataRows
    .map((row, rowIndex) => {
      const r = rowIndex + 2;
      const cells = headers
        .map((header, colIndex) => {
          const value = row[header];
          const ref = cellRef(r, colIndex + 1);
          if (typeof value === "number") return `<c r="${ref}"><v>${value}</v></c>`;
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${r}">${cells}</row>`;
    })
    .join("");
  const columns = headers
    .map((header, index) => `<col min="${index + 1}" max="${index + 1}" width="${Math.min(Math.max(header.length + 6, 12), 28)}" customWidth="1"/>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>${columns}</cols>
  <sheetData><row r="1">${headerXml}</row>${bodyXml}</sheetData>
  <autoFilter ref="A1:${cellRef(dataRows.length + 1, headers.length)}"/>
</worksheet>`;
}

async function writeWorkbook({ headers, rows, sprintRows, summaryRows }) {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Agile Tasks" sheetId="1" r:id="rId1"/>
    <sheet name="Dataset Summary" sheetId="2" r:id="rId2"/>
    <sheet name="Sprint Summary" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`;
  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  const now = new Date().toISOString();
  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Agile Project Tracking Dataset</dc:title><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
  const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Microsoft Excel</Application></Properties>`;

  await writeZip(
    [
      { path: "[Content_Types].xml", content: contentTypes },
      { path: "_rels/.rels", content: rootRels },
      { path: "xl/workbook.xml", content: workbookXml },
      { path: "xl/_rels/workbook.xml.rels", content: workbookRels },
      { path: "xl/styles.xml", content: stylesXml },
      { path: "xl/worksheets/sheet1.xml", content: sheetXml(headers, rows) },
      {
        path: "xl/worksheets/sheet2.xml",
        content: sheetXml(["Metric", "Value"], summaryRows.map(([Metric, Value]) => ({ Metric, Value }))),
      },
      {
        path: "xl/worksheets/sheet3.xml",
        content: sheetXml(
          ["Sprint Name", "Total Tasks", "Completed Tasks", "Planned Story Points", "Completed Story Points", "Completion Rate"],
          sprintRows.map((row) => ({
            "Sprint Name": row[0],
            "Total Tasks": row[1],
            "Completed Tasks": row[2],
            "Planned Story Points": row[3],
            "Completed Story Points": row[4],
            "Completion Rate": row[5],
          })),
        ),
      },
      { path: "docProps/core.xml", content: coreXml },
      { path: "docProps/app.xml", content: appXml },
    ],
    outputXlsx,
  );
}

await fs.mkdir(datasetDir, { recursive: true });

const storyPointOptions = [1, 2, 3, 5, 8, 13];
const storyPointWeights = [0.1, 0.16, 0.28, 0.25, 0.16, 0.05];
const sprints = sprintCalendar();
const rows = [];

for (let taskNum = 1; taskNum <= RECORD_COUNT; taskNum += 1) {
  const sprint = choice(sprints);
  const priority = weightedChoice(priorities, priorityWeights);
  const riskLevel = weightedChoice(riskLevels, riskWeights);
  const status = chooseStatus(sprint["Sprint End"]);
  const storyPoints = weightedChoice(storyPointOptions, storyPointWeights);
  const startDate = addDays(sprint["Sprint Start"], randInt(0, 8));
  const dueDate = new Date(Math.min(addDays(startDate, randInt(3, 12)).getTime(), addDays(sprint["Sprint End"], 5).getTime()));

  let completionDate = "";
  if (status === "Done") {
    const delayBias = { Low: 0, Medium: randInt(0, 3), High: randInt(1, 7) }[riskLevel];
    const delta = weightedChoice([-2, -1, 0, 1, 2, delayBias], [0.08, 0.12, 0.34, 0.18, 0.16, 0.12]);
    completionDate = dateOnly(new Date(Math.max(addDays(dueDate, delta).getTime(), addDays(startDate, 1).getTime())));
  }

  const estimated = estimateHours(storyPoints, riskLevel, priority);
  const actual = actualHours(estimated, status, riskLevel);
  const overdue =
    (status !== "Done" && dueDate < new Date("2025-07-15T00:00:00")) ||
    (status === "Done" && completionDate && new Date(completionDate) > dueDate);
  const cycleTime =
    status === "Done" && completionDate
      ? Math.max(1, Math.round((new Date(completionDate) - startDate) / 86400000))
      : 0;

  rows.push({
    "Task ID": `APT-${String(taskNum).padStart(4, "0")}`,
    Epic: choice(epics),
    "Sprint Name": sprint["Sprint Name"],
    "Team Member": choice(teamMembers),
    Priority: priority,
    "Story Points": storyPoints,
    "Task Status": status,
    "Start Date": dateOnly(startDate),
    "Due Date": dateOnly(dueDate),
    "Completion Date": completionDate,
    Department: choice(departments),
    "Risk Level": riskLevel,
    "Estimated Hours": estimated,
    "Actual Hours": actual,
    "Delay Reason": overdue ? choice(delayReasons) : "None",
    "Sprint Start Date": dateOnly(sprint["Sprint Start"]),
    "Sprint End Date": dateOnly(sprint["Sprint End"]),
    "Cycle Time Days": cycleTime,
    "Is Overdue": overdue ? "Yes" : "No",
    "Completed Flag": status === "Done" ? 1 : 0,
  });
}

const headers = Object.keys(rows[0]);
const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
await fs.writeFile(outputCsv, csv, "utf8");

const completed = rows.filter((row) => row["Task Status"] === "Done").length;
const pending = rows.length - completed;
const overdue = rows.filter((row) => row["Is Overdue"] === "Yes").length;
const highRisk = rows.filter((row) => row["Risk Level"] === "High").length;
const avgCycle =
  rows.filter((row) => row["Task Status"] === "Done").reduce((sum, row) => sum + row["Cycle Time Days"], 0) / completed;
const summaryRows = [
  ["Total Tasks", rows.length],
  ["Completed Tasks", completed],
  ["Pending Tasks", pending],
  ["Completion Rate", completed / rows.length],
  ["Average Cycle Time", Number(avgCycle.toFixed(2))],
  ["Overdue Tasks", overdue],
  ["High Risk Tasks", highRisk],
];

const sprintRows = sprints.map((sprint) => {
  const sprintTasks = rows.filter((row) => row["Sprint Name"] === sprint["Sprint Name"]);
  const sprintDone = sprintTasks.filter((row) => row["Task Status"] === "Done");
  return [
    sprint["Sprint Name"],
    sprintTasks.length,
    sprintDone.length,
    sprintTasks.reduce((sum, row) => sum + row["Story Points"], 0),
    sprintDone.reduce((sum, row) => sum + row["Story Points"], 0),
    sprintDone.length / sprintTasks.length,
  ];
});
await writeWorkbook({ headers, rows, sprintRows, summaryRows });

console.log(`Generated ${rows.length} records`);
console.log(`Excel: ${outputXlsx.pathname}`);
console.log(`CSV: ${outputCsv.pathname}`);
