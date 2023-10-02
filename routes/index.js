var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path"); // for handling file paths

const tasksFilePath = path.join(__dirname, "..", "db", "tasks.json"); // Assuming tasks.json is in the 'db' directory

// Middleware to check if tasks.json exists, and create it if not
router.use((req, res, next) => {
  if (!fs.existsSync(tasksFilePath)) {
    // If the file doesn't exist, create an empty JSON array
    const emptyTasksArray = [];
    fs.writeFileSync(tasksFilePath, JSON.stringify(emptyTasksArray), "utf8");
  }
  next();
});

// Middleware function to sort tasks by startDate, startTime, and update task IDs
router.use((req, res, next) => {
  // Read the current tasks from the tasks.json file
  fs.readFile(tasksFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Failed to read tasks data" });
    }

    try {
      // Parse the JSON data into an array of tasks
      const tasks = JSON.parse(data);

      // Sort tasks by startDate and then by startTime in ascending order
      tasks.sort((a, b) => {
        const dateA = new Date(a.startDate + " " + a.startTime);
        const dateB = new Date(b.startDate + " " + b.startTime);
        return dateA - dateB;
      });

      // Update task IDs to start from 0 and go up consecutively
      tasks.forEach((task, index) => {
        task.id = index; // Set the task's ID to the current index
      });

      // Write the updated and sorted list of tasks back to the tasks.json file
      fs.writeFile(
        tasksFilePath,
        JSON.stringify(tasks, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .send({ error: "Failed to update tasks data" });
          }

          // Continue to the next middleware or route handler
          next();
        }
      );
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).send({ error: "Failed to parse tasks data" });
    }
  });
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Task Tracker" });
});

router.get("/view", function (req, res, next) {
  let tasks;

  // Read tasks from the JSON file
  fs.readFile(tasksFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      tasks = []; // Initialize tasks as an empty array if there's an error reading the file
    } else {
      try {
        tasks = JSON.parse(data); // Parse the JSON data from the file
      } catch (parseError) {
        console.error(parseError);
        tasks = []; // Initialize tasks as an empty array if there's an error parsing the JSON data
      }
    }

    res.render("viewIndex", { title: "Task List View", tasks: tasks });
  });
});

router.get("/track", function (req, res, next) {
  res.render("trackIndex", { title: "Track A New Task" });
});

router.get("/edit/:id", function (req, res, next) {
  const { id } = req.params;

  // Read the current tasks from the tasks.json file
  fs.readFile(tasksFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Failed to read tasks data" });
    }

    try {
      // Parse the JSON data into an array of tasks
      const tasks = JSON.parse(data);

      // Find the task with the specified ID
      const task = tasks.find((task) => task.id == id);

      if (!task) {
        return res.status(404).send({ error: "Task not found" });
      }

      // Format startDate and startTime for default values
      const formattedStartDate = formatDateForInput(task.startDate); // Format to "YYYY-MM-DD"
      const formattedStartTime = formatTimeForInput(task.startTime); // Format to "HH:MM"
      const formattedEndDate = formatDateForInput(task.endDate);
      const formattedEndTime = formatTimeForInput(task.endTime);

      console.log(formattedStartDate, formattedStartTime);

      // Render the "editTask" view with the formatted task data and a title
      res.render("taskIndex", {
        task: {
          ...task,
          startDate: formattedStartDate,
          startTime: formattedStartTime,
          endDate: formattedEndDate,
          endTime: formattedEndTime,
        },
        title: "Edit Task",
      });
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).send({ error: "Failed to parse tasks data" });
    }
  });
});

module.exports = router;

// Function to convert date from "MM/DD/YYYY" to "YYYY-MM-DD" format
function formatDateForInput(dateString) {
  const dateParts = dateString.split("/");
  if (dateParts.length === 3) {
    const [month, day, year] = dateParts.map((part) => part.padStart(2, "0"));
    return `${year}-${month}-${day}`;
  }
  // Return the input date if it's not in the expected format
  return dateString;
}

// Function to convert 12-hour time format to 24-hour format (e.g., "2:05 pm" to "14:05")
function formatTimeForInput(timeString) {
  if (timeString) {
    const [time, ampm] = timeString.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    if (!isNaN(hours) && !isNaN(minutes)) {
      let formattedHours = hours;
      if (ampm && ampm.toLowerCase() === "pm" && hours < 12) {
        formattedHours += 12;
      } else if (ampm && ampm.toLowerCase() === "am" && hours === 12) {
        formattedHours = 0;
      }

      const formattedHoursStr = formattedHours.toString().padStart(2, "0");
      const formattedMinutesStr = minutes.toString().padStart(2, "0");

      return `${formattedHoursStr}:${formattedMinutesStr}`;
    }
  }

  // Return the input time if it's not in the expected format
  return timeString;
}
