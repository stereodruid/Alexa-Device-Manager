  function applyFilter() {
    const q = admSearch.value.trim().toLowerCase();
    const type = admType.value;
    const selectedSource = admSource.value;
    const members = activeGroupMembers();
    const groupMode = admGroup.value;
    state.filtered = state.devices.filter(d => {
      if (admOnlyHA.checked && !isHA(d)) return false;
      if (admHideProtected.checked && isProtected(d)) return false;
      if (type && deviceType(d) !== type) return false;
      if (selectedSource && sourceKey(d) !== selectedSource) return false;
      if (groupMode && !members.has(d.id) && d.id !== groupMode) return false;
      if (q) {
        const hay = \\$\{d.displayName || ''\} \$\{d.description || ''\} \$\{source(d)\} \$\{deviceType(d)\} \$\{category(d)\} \$\{d.id || ''\}\.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    state.filtered.sort((a, b) => {
      let valA = "", valB = "";
      if (state.sortCol === "name") { valA = (a.displayName || "").toLowerCase(); valB = (b.displayName || "").toLowerCase(); }
      else if (state.sortCol === "description") { valA = (a.description || "").toLowerCase(); valB = (b.description || "").toLowerCase(); }
      else if (state.sortCol === "type") { valA = deviceType(a).toLowerCase(); valB = deviceType(b).toLowerCase(); }
      else if (state.sortCol === "status") { valA = (a._admReachability || a.availability || "").toLowerCase(); valB = (b._admReachability || b.availability || "").toLowerCase(); }
      else if (state.sortCol === "id") { valA = (a.id || "").toLowerCase(); valB = (b.id || "").toLowerCase(); }
      if (valA < valB) return -1 * state.sortDir;
      if (valA > valB) return 1 * state.sortDir;
      return 0;
    });

    renderTable();
    renderStats();
  }
