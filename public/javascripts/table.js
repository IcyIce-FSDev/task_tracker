// Logic to handle Stop button
async function stop(button) {
  // Access the task data using the data-task attribute
  const taskData = button.getAttribute("data-task");

  // Parse the JSON string to get the JavaScript object
  const task = JSON.parse(taskData);

  // Get the current date in "month/day/year" format
  const currentDate = new Date();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = currentDate.getDate().toString().padStart(2, "0");
  const year = currentDate.getFullYear();
  // Get the current time in "hour:min am/pm" format
  let hours = (currentDate.getHours() % 12).toString(); // Remove leading 0
  if (hours === "0") {
    hours = "12"; // Handle 0 as 12 for midnight
  }
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const amPm = currentDate.getHours() >= 12 ? "pm" : "am";

  const formattedDate = `${month}/${day}/${year}`;
  const formattedTime = `${hours}:${minutes} ${amPm}`;

  const start = `${task.startDate} ${task.startTime}`;

  const formatStart = new Date(start);
  const timeDifference = currentDate - formatStart;

  const duration = convertMillisecondsToReadableTime(timeDifference);

  try {
    const resp = await axios.put(`/api/stop/${task.id}`, {
      endDate: formattedDate,
      endTime: formattedTime,
      duration: duration,
    });

    if (resp.data.update) {
      location.reload();
    }
  } catch (error) {
    console.log(error);
  }
}

// Logic to handle Delete button
async function del(button) {
  // Access the task data using the data-task attribute
  const taskData = button.getAttribute("data-task");

  // Parse the JSON string to get the JavaScript object
  const task = JSON.parse(taskData);

  // Perform any actions you need with the 'task' object
  console.log(task.id);

  try {
    const resp = await axios.delete(`/api/delete/${task.id}`);

    if (resp.data.success) {
      location.reload();
    }
  } catch (error) {
    console.log(error);
  }
}

// Logic to handle Edit button
function edit(button) {
  // Access the task data using the data-task attribute
  const taskData = button.getAttribute("data-task");

  // Parse the JSON string to get the JavaScript object
  const task = JSON.parse(taskData);

  // Get the task's ID
  const taskId = task.id;

  // Construct the edit route URL
  const editUrl = `/edit/${taskId}`;

  // Redirect the user to the edit URL
  window.location.href = editUrl;
}

// Gets the durations and starts process of calculating the time since
let durationHTMLCollection = document.getElementsByClassName("duration");

let arrayDurations = [...durationHTMLCollection];

function updateDurations() {
  arrayDurations.forEach((duration) => {
    const timeData = duration.getAttribute("data");
    const time = JSON.parse(timeData);
    const timeFormatted = `${time[0]} ${time[1]}`;

    // Parse the timeFormatted string into a Date object
    const eventTime = new Date(timeFormatted);

    const currentTime = new Date();

    // Calculate the time difference in milliseconds
    const timeDifference = currentTime - eventTime;

    // Convert the time to readable human format
    const converted = convertMillisecondsToReadableTime(timeDifference);

    // Update the innerHTML of the duration element
    duration.innerHTML = converted;
  });
}

updateDurations();
setInterval(updateDurations, 60000);

function convertMillisecondsToReadableTime(milliseconds) {
  if (milliseconds < 0) {
    return "0 minutes";
  }

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const days = Math.floor(milliseconds / msPerDay);
  const hours = Math.floor((milliseconds % msPerDay) / msPerHour);
  const minutes = Math.floor((milliseconds % msPerHour) / msPerMinute);

  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days > 1 ? "s" : ""}`);
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  }

  return parts.join(", ");
}
