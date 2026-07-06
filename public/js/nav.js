function renderSidebar(active) {
  const user = Api.currentUser();
  const links = [
    { href: "/dashboard.html", label: "Dashboard", icon: "dashboard" },
    { href: "/tickets.html", label: "Tickets", icon: "ticket" },
    { href: "/custom-fields.html", label: "Custom Fields", icon: "field", roles: ["admin"] },
    { href: "/payroll.html", label: "Payroll", icon: "payroll", roles: ["admin"] }
  ];
  const nav = links
    .filter((l) => !l.roles || (user && l.roles.includes(user.role)))
    .map((l) => `<a href="${l.href}" class="${active === l.href ? "active" : ""}">${Icons[l.icon]}<span>${l.label}</span></a>`)
    .join("");

  document.getElementById("sidebar").innerHTML = `
    <div class="brand">${Icons.logo}<span>Fresh Ticketing</span></div>
    <nav>${nav}</nav>
    <div class="user-box">
      <span class="who">${user ? `${user.name} · ${user.role}` : ""}</span>
      <button onclick="Api.logout()" title="Log out">${Icons.logout}</button>
    </div>
  `;
}
