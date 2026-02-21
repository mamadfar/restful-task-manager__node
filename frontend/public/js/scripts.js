const tasksList = document.getElementById("tasks-list");
const taskForm = document.getElementById("task-form");
const message = document.getElementById("message");
const allStatusInput = document.getElementById("all");
const completedStatusInput = document.getElementById("completed");
const inProgressStatusInput = document.getElementById("in-progress");
const nextBtn = document.getElementById("next-button");
const prevBtn = document.getElementById("prev-button");
const pageLabel = document.getElementById("page-label");
const pagination = document.getElementById("pagination");

axios.defaults.baseURL = "http://localhost:3000/api/v1";

const limit = 3;
let currentPage = 1;
let finished = undefined;
let totalTasks, totalPages;

const loadTasks = async () => {
  try {
    const { data } = await axios.get("/tasks", {
      params: {
        page: currentPage,
        limit,
        finished,
      },
    });
    if (data.success) {
        totalTasks = data.pagination.totalTasks;
        totalPages = data.pagination.totalPages;
      if (data.body.length) {
        tasksList.classList.remove("d-none");
        message.classList.add("d-none");
        let str = "";
        for (const task of data.body) {
          str += `
            <li
              class="list-group-item d-flex bg-light"
              data-id="${task.id}"
            >
              <div class="flex-grow-1 d-flex align-items-center">
                <label class="form-check-label user-select-none">${task.title}</label>
                <span
                  class="badge ${task.completed ? "bg-success" : "bg-secondary"} ms-auto me-3 user-select-none"
                  >${task.completed ? "Completed" : "In progress"}</span
                >
              </div>
              <button
                class="btn btn-sm ${task.completed ? "btn-secondary" : "btn-success"} me-3 toggle-btn"
              >
                Toggle
              </button>
              <button class="btn btn-sm btn-primary me-3 edit-btn">Edit</button>
              <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </li>
          `;
        }
        tasksList.innerHTML = str;
      } else {
        message.classList.remove("d-none");
        tasksList.classList.add("d-none");
        tasksList.innerHTML = "";
      }
      if (totalTasks > limit) {
        pagination.classList.remove("d-none");
        pageLabel.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtn.disabled = nextBtn.disabled = false;
        if (currentPage === 1) {
          prevBtn.disabled = true;
        } else if (currentPage === totalPages) {
          nextBtn.disabled = true;
        } else {
          prevBtn.disabled = false;
        }
      } else {
        pagination.classList.add("d-none");
      }
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error.response.data.message);
  }
}

nextBtn.addEventListener("click", () => {
  currentPage++;
  loadTasks();
})

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadTasks();
  }
})

allStatusInput.addEventListener("change", () => {
  finished = undefined;
  currentPage = 1;
  loadTasks();
});

completedStatusInput.addEventListener("change", () => {
  finished = true;
  currentPage = 1;
  loadTasks();
});

inProgressStatusInput.addEventListener("change", () => {
  finished = false;
  currentPage = 1;
  loadTasks();
});

document.addEventListener("DOMContentLoaded", () => {
  allStatusInput.checked = true;
  loadTasks();
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const title = formData.get("title");
  const completed = formData.get("completed") === "on";

  if (!title || title.trim() === "" || title.length < 3) {
    alert("Title must be at least 3 characters long");
    return;
  }

  try {
    const {data} = await axios.post("/tasks", { title, completed });
    if (data.success) {
      if (totalTasks === 0) {
        currentPage = 1;
      } else if (totalTasks % limit) {
        currentPage = totalPages;
      } else {
        currentPage = totalPages + 1;
      }
      loadTasks();
      taskForm.reset();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error.response.data.message);
  }
});

tasksList.addEventListener("click", async (event) => {
  event.preventDefault();
  const target = event.target;
  const label = target.parentElement.querySelector("label");
  const titleText = label.textContent;
  const badge = target.parentElement.querySelector(".badge");
  const completed = badge.textContent === "Completed" ? true : false;
  const id = parseInt(target.parentElement.dataset.id);

  //* Toggle task
  if (target.classList.contains("toggle-btn")) {
    try {
      const res = await axios.put(`/tasks/${id}`, { title: titleText, completed: !completed });
      if (res.data.success) {
        // location.reload();
        if (badge.textContent === "Completed") {
          badge.textContent = "In progress";
          badge.classList.remove("bg-success");
          badge.classList.add("bg-secondary");
        } else {
          badge.textContent = "Completed";
          badge.classList.remove("bg-secondary");
          badge.classList.add("bg-success");
        }
        const toggleBtn = target.parentElement.querySelector(".toggle-btn");
        if (toggleBtn.classList.contains("btn-success")) {
          toggleBtn.classList.remove("btn-success");
          toggleBtn.classList.add("btn-secondary");
        } else {
          toggleBtn.classList.remove("btn-secondary");
          toggleBtn.classList.add("btn-success");
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(error.response.data.message);
    }
  } 
  //* Edit task
  else if (target.classList.contains("edit-btn")) {
    const title = prompt("Please enter the new title", titleText);

    if (title && title.trim() !== "" && title.length >= 3 && title !== titleText) {
      try {
        const {data} = await axios.put(`/tasks/${id}`, { title, completed });
        if (data.success) {
          label.textContent = title;
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert(error.response.data.message);
      }
    } else if (title.length < 3) {
      alert("Title must be at least 3 characters long");
    }
  } 
  //* Delete task
  else if (target.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const {data} = await axios.delete(`/tasks/${id}`);
        if (data.success) {
          if (tasksList.children.length === 1 && currentPage > 1) {
            currentPage--;
          }
          loadTasks();
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert(error.response.data.message);
      }
    }
  }
});
