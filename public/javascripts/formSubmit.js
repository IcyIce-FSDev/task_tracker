async function handleSubmit(event) {
  event.preventDefault();

  // Access the form elements by their "name" attribute
  const taskName = event.target.taskName.value;
  const startDate = event.target.startDate.value;
  const startTime = event.target.startTime.value;

  // Convert for proper format
  const parsedName = String(taskName);
  const convertDate = formatDate(startDate);
  const convertTime = convertToAMPM(startTime);

  const obj = {
    name: parsedName,
    startDate: convertDate,
    startTime: convertTime,
  };

  try {
    const resp = await axios.post("/api/newTask", obj);

    console.log(resp);

    if (resp.data.added) {
      // Handle the redirection manually if needed
      window.location.href = "/view"; // Redirect to the specified location
    } else {
      console.log(resp.data);
    }
  } catch (error) {
    console.log(error);
  }
}

function convertToAMPM(time) {
  // Split the time string into hours and minutes
  const [hours, minutes] = time.split(":").map(Number);

  // Determine if it's AM or PM
  const ampm = hours >= 12 ? "pm" : "am";

  // Convert hours from 24-hour format to 12-hour format
  const hours12 = hours % 12 || 12;

  // Format the result as "hh:mm AM/PM"
  const formattedTime = `${hours12}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;

  return formattedTime;
}

function formatDate(inputDate) {
  const dateParts = inputDate.split("-");
  if (dateParts.length === 3) {
    const [year, month, day] = dateParts;
    return `${month}/${day}/${year}`;
  }
  // Return the input date if it's not in the expected format
  return inputDate;
}

document.addEventListener("DOMContentLoaded", () => {
  // Set default values for startDate and startTime inputs
  document.getElementById("startDateInput").value = getCurrentDate();
  document.getElementById("startTimeInput").value = getCurrentTime();
});

function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const currentTime = new Date();
  const hours = String(currentTime.getHours()).padStart(2, "0");
  const minutes = String(currentTime.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
