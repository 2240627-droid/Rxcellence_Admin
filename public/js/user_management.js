const usersTableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");
const applyFiltersBtn = document.getElementById("applyFilters");
const exportCSVBtn = document.getElementById("exportCSV");

async function fetchUsers() {
  const search = searchInput.value;
  const role = roleFilter.value;
  const status = statusFilter.value;

  const params = new URLSearchParams({ search, role, status });
  const res = await fetch(`/admin/users?${params}`);
  const data = await res.json();

  if (data.success) {
    populateTable(data.users);
    updateCards(data.users);
  }
}

function populateTable(users) {
  usersTableBody.innerHTML = "";
  users.forEach((user, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><input type="checkbox" class="userCheckbox" data-id="${user.request_id}"></td>
            <td>${user.name}</td>
            <td>${user.user_type}</td>
            <td>${user.license_number}</td>
            <td>${user.affiliated_id}</td>
            <td>${user.status}</td>
            <td>
                <button class="action-btn edit">Edit</button>
                <button class="action-btn approve">Approve</button>
                <button class="action-btn reject">Reject</button>
                <button class="action-btn suspend">Suspend</button>
            </td>
        `;
    usersTableBody.appendChild(tr);

    // Add event listeners for each action button
    const approveBtn = tr.querySelector(".approve");
    approveBtn.addEventListener("click", () =>
      updateStatus(user.request_id, "Approved")
    );

    const rejectBtn = tr.querySelector(".reject");
    rejectBtn.addEventListener("click", () =>
      updateStatus(user.request_id, "Declined")
    );

    const suspendBtn = tr.querySelector(".suspend");
    suspendBtn.addEventListener("click", () =>
      updateStatus(user.request_id, "Suspended")
    );

    const editBtn = tr.querySelector(".edit");
    editBtn.addEventListener("click", () =>
      alert(`Edit user ${user.name} (to be implemented)`)
    );
  });
}

async function updateStatus(userId, status) {
  await fetch(`/admin/users/${userId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  fetchUsers();
}

function updateCards(users) {
  document.getElementById("pendingCount").textContent = users.filter(
    (u) => u.status === "Pending"
  ).length;
  document.getElementById("approvedCount").textContent = users.filter(
    (u) => u.status === "Approved"
  ).length;
  document.getElementById("suspendedCount").textContent = users.filter(
    (u) => u.status === "Suspended"
  ).length;
}

// Event listeners
applyFiltersBtn.addEventListener("click", fetchUsers);
exportCSVBtn.addEventListener(
  "click",
  () => (window.location.href = "/admin/export")
);
searchInput.addEventListener("keyup", fetchUsers);

// Select all checkbox (optional if you add one)
const selectAllCheckbox = document.getElementById("selectAll");
if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener("change", () => {
    const checkboxes = document.querySelectorAll(".userCheckbox");
    checkboxes.forEach((cb) => (cb.checked = selectAllCheckbox.checked));
  });
}

// General bulk action function
async function bulkAction(status) {
  const selectedCheckboxes = document.querySelectorAll(".userCheckbox:checked");
  if (selectedCheckboxes.length === 0) {
    alert("Please select at least one user.");
    return;
  }

  const ids = Array.from(selectedCheckboxes).map((cb) => cb.dataset.id);

  try {
    const response = await fetch("/admin/users/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status }),
    });

    const result = await response.json();
    if (result.success) {
      alert(`${status} action applied successfully!`);
      fetchUsers(); // reload table
    } else {
      alert("Error updating users");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

async function bulkDelete() {
  const selectedCheckboxes = document.querySelectorAll(".userCheckbox:checked");

  if (selectedCheckboxes.length === 0) {
    alert("Please select at least one user.");
    return;
  }

  if (
    !confirm(
      "Are you sure you want to DELETE the selected users? This action cannot be undone."
    )
  ) {
    return;
  }

  const ids = Array.from(selectedCheckboxes).map((cb) => cb.dataset.id);

  try {
    const response = await fetch("/admin/users/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Users deleted successfully!");
      fetchUsers(); // refresh table
    } else {
      alert("Error deleting users");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// Bind buttons
document
  .getElementById("approveSelected")
  .addEventListener("click", () => bulkAction("Approved"));
document
  .getElementById("rejectSelected")
  .addEventListener("click", () => bulkAction("Rejected"));
document
  .getElementById("suspendSelected")
  .addEventListener("click", () => bulkAction("Suspended"));
document
  .getElementById("activateSelected")
  .addEventListener("click", () => bulkAction("Active"));

document
  .getElementById("deleteSelected")
  .addEventListener("click", () => bulkDelete());

// CSV export
exportCSVBtn.addEventListener("click", () => {
  const search = searchInput.value;
  const role = roleFilter.value;
  const status = statusFilter.value;

  const params = new URLSearchParams({ search, role, status });
  window.location.href = `/admin/export?${params.toString()}`;
});

// Initial fetch
fetchUsers();
