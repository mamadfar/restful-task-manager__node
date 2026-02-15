const tasksList = document.getElementById("tasks-list");
const taskForm = document.getElementById("task-form");
const message = document.getElementById('message');

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const title = formData.get("title");
  const completed = formData.get("completed") === "on";

  if (!title || title.trim() === '' || title.length < 3) {
    alert("Title must be at least 3 characters long");
    return;
  }

  try {
    const res = await axios.post('/add-task', { title, completed });
    if(res.data.success) {
      message.classList.add('d-none');
      tasksList.classList.remove('d-none');
      const id = res.data.id;
      tasksList.innerHTML += `
        <li
            class="list-group-item d-flex bg-light"
            data-id="${id}"
        >
        <div class="flex-grow-1 d-flex align-items-center">
          <label class="form-check-label user-select-none">${title}</label>
          <span class="badge ${completed ? 'bg-success' : 'bg-secondary'} ms-auto me-3 user-select-none">${completed ? "Completed" : "In progress"}</span>
        </div>
          <button class="btn btn-sm me-3 ${completed ? 'btn-secondary' : 'btn-success'} toggle-btn">Toggle</button>
          <button class="btn btn-sm me-3 btn-primary edit-btn">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn">Delete</button>
        </li>
      `;
      taskForm.reset();
    }
  } catch (error) {
    alert(error.response.data);
  }
});

tasksList.addEventListener("click", async (event) => {
  event.stopPropagation()
  const target = event.target;
  const id = parseInt(target.parentElement.dataset.id);

  //* Toggle task
  if (target.classList.contains("toggle-btn")) {
    try {
      const res = await axios.post("/toggle-task", { id });
      if (res.data.success) {
        // location.reload();
        const span = target.parentElement.querySelector(".badge");
        if (span.textContent === "Completed") {
          span.textContent = "In progress";
          span.classList.remove("bg-success");
          span.classList.add("bg-secondary");
        } else {
          span.textContent = "Completed";
          span.classList.remove("bg-secondary");
          span.classList.add("bg-success");
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
        alert(res.data);
      }
    } catch (error) {
      console.log(error.response?.data);
    }
    //* Edit task
  } else if (target.classList.contains("edit-btn")) {
    const label = target.parentElement.querySelector("label")
    const text = label.textContent;
    const title = prompt("Please enter the new title", text);

    if (title && title.trim() !== "" && title.length >= 3 && title !== text) {
      try {
        const res = await axios.put("/edit-task", { id, title });
        if (res.data.success) {
          //   location.reload();
          label.textContent = title;
        } else {
          alert(res.data);
        }
      } catch (error) {
        alert(error.response.data);
      }
    } else if (title.length < 3) {
      alert("Title must be at least 3 characters long");
    }
    //* Delete task
  } else if (target.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const res = await axios.delete("/delete-task", { data: { id } });
        if (res.data.success) {
          //   location.reload();
          target.parentElement.remove();
          if(!document.querySelectorAll("li").length) {
            tasksList.classList.add('d-none');
            message.classList.remove('d-none');
          }
        } else {
          alert(res.data);
        }
      } catch (error) {
        console.log(error.response.data);
      }
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const {data} = await axios.get('/get-tasks');
    if(data instanceof Array) {
      if(data.length) {
        tasksList.classList.remove('d-none');
        let str = '';
        for(const task of data) {
          str += `
            <li
              class="list-group-item d-flex bg-light"
              data-id="${task.id}"
            >
              <div class="flex-grow-1 d-flex align-items-center">
                <label class="form-check-label user-select-none">${task.title}</label>
                <span
                  class="badge ${task.completed ? 'bg-success' : 'bg-secondary'} ms-auto me-3 user-select-none"
                  >${task.completed ? "Completed" : "In progress"}</span
                >
              </div>
              <button
                class="btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-success'} me-3 toggle-btn"
              >
                Toggle
              </button>
              <button class="btn btn-sm btn-primary me-3 edit-btn">Edit</button>
              <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </li>
          `
        }
        tasksList.innerHTML = str;
      } else {
        message.classList.remove('d-none');
      }
    } else {
      alert(data);
    }
  } catch (error) {
    alert(error.response.data);
  }
})