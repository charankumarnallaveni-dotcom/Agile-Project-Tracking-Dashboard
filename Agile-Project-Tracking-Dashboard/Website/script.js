const dashboardPages = {
  executive: {
    title: "Executive Overview",
    image: "Agile-Project-Tracking-Dashboard/Images/executive_overview_mockup.svg",
    alt: "Executive Overview dashboard mockup",
    description:
      "Tracks total tasks, completed tasks, pending work, sprint completion, average cycle time, and team utilization for stakeholder reporting.",
  },
  sprint: {
    title: "Sprint Analysis",
    image: "Agile-Project-Tracking-Dashboard/Images/sprint_analysis_mockup.svg",
    alt: "Sprint Analysis dashboard mockup",
    description:
      "Compares planned versus completed story points, sprint-wise performance, and remaining work trends for sprint planning and backlog tracking.",
  },
  team: {
    title: "Team Performance",
    image: "Agile-Project-Tracking-Dashboard/Images/team_performance_mockup.svg",
    alt: "Team Performance dashboard mockup",
    description:
      "Visualizes team member workload, task distribution, completion rate, estimated hours, actual hours, and resource utilization.",
  },
  health: {
    title: "Project Health",
    image: "Agile-Project-Tracking-Dashboard/Images/project_health_mockup.svg",
    alt: "Project Health dashboard mockup",
    description:
      "Highlights overdue tasks, high-risk work, delay reasons, delivery variance, and status bottlenecks for workflow optimization.",
  },
};

const image = document.querySelector("#dashboard-image");
const notes = document.querySelector("#dashboard-notes");
const tabs = document.querySelectorAll(".tab");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const page = dashboardPages[tab.dataset.dashboard];
    if (!page) return;

    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    image.src = page.image;
    image.alt = page.alt;
    notes.innerHTML = `<h3>${page.title}</h3><p>${page.description}</p>`;
  });
});
