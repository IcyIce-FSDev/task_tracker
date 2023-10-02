document.addEventListener("DOMContentLoaded", () => {
  const activeCheckbox = document.querySelector('[name="active"]');
  const endDateSection = document.querySelector(".endDateSection");
  const cancelButton = document.querySelector('button[type="cancel"]');
  const submitButton = document.querySelector('button[type="submit"]');

  // Function to format a date to "MM/DD/YYYY" format
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  };

  // Function to format a time to "HH:MM am/pm" format
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const ampm = hours < 12 ? "am" : "pm";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  activeCheckbox.addEventListener("change", () => {
    endDateSection.style.display = activeCheckbox.checked ? "none" : "flex";
  });

  cancelButton.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "/view";
  });

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    // Gather form data
    const id = document.querySelector('[name="id"]').value;
    const taskName = document.querySelector('[name="taskName"]').value;
    const isActive = activeCheckbox.checked;
    const startDate = formatDate(
      document.querySelector('[name="startDate"]').value
    );
    const startTime = formatTime(
      document.querySelector('[name="startTime"]').value
    );

    let endTime = "";
    let endDate = "";
    let duration = "";

    // Conditionally set based on the checkbox state
    if (!isActive) {
      endTime = formatTime(document.querySelector('[name="endTime"]').value);
      endDate = formatDate(document.querySelector('[name="endDate"]').value);
      duration = calculateDuration(startDate, startTime, endDate, endTime);
    }

    // Create a JavaScript object with the gathered data
    const taskData = {
      id: id,
      name: taskName,
      active: isActive,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      duration: duration,
    };

    try {
      const resp = await axios.put(`/api/edit/${taskData.id}`, taskData);

      if (resp.data.success) {
        window.location.href = "/view";
      }
    } catch (error) {
      console.log(error);
    }
  });

  // Initialize visibility based on the initial state of the 'active' checkbox
  endDateSection.style.display = activeCheckbox.checked ? "none" : "flex";
});

// Function to calculate and format the duration between start and end times
function calculateDuration(startDate, startTime, endDate, endTime) {
  const startDateTime = parseDateTime(startDate, startTime);
  const endDateTime = parseDateTime(endDate, endTime);

  if (isNaN(startDateTime) || isNaN(endDateTime)) {
    return "Invalid";
  }

  const durationMillis = endDateTime - startDateTime;

  if (durationMillis <= 0) {
    return "Invalid";
  }

  const totalSeconds = Math.floor(durationMillis / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor(((totalSeconds % 86400) % 3600) / 60);

  const durationParts = [];

  if (days > 0) {
    durationParts.push(`${days} day${days > 1 ? "s" : ""}`);
  }
  if (hours > 0) {
    durationParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  }
  if (minutes > 0) {
    durationParts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  }

  return durationParts.join(" ");
}

// Function to parse date and time strings and return a valid Date object
function parseDateTime(dateString, timeString) {
  // Parse the date string in MM/DD/YYYY format
  const dateParts = dateString.split("/");
  if (dateParts.length !== 3) {
    return null; // Invalid date format
  }
  const month = parseInt(dateParts[0]);
  const day = parseInt(dateParts[1]);
  const year = parseInt(dateParts[2]);

  // Parse the time string in HH:mm am/pm format
  const timeParts = timeString.match(/(\d+):(\d+) ([ap]m)/i);
  if (!timeParts || timeParts.length !== 4) {
    return null; // Invalid time format
  }
  let hours = parseInt(timeParts[1]);
  const minutes = parseInt(timeParts[2]);
  const ampm = timeParts[3].toLowerCase();

  if (ampm === "pm" && hours < 12) {
    hours += 12;
  } else if (ampm === "am" && hours === 12) {
    hours = 0;
  }

  // Create a Date object with the parsed date and time components
  const dateTime = new Date(year, month - 1, day, hours, minutes);
  return dateTime;
}
