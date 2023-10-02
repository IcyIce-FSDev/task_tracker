var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path"); // for handling file paths

const tasksFilePath = path.join(__dirname, "..", "db", "tasks.json"); // Assuming tasks.json is in the 'db' directory

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

// Assumes route comes in to /api/
router.put("/stop/:id", function (req, res, next) {
  const { id } = req.params;
  const { endDate, endTime, duration } = req.body;

  //   Read the contents of the tasks.json file
  fs.readFile(tasksFilePath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ error: "Failed to read tasks data" });
    }

    try {
      // Parse the JSON data into an array of tasks
      const tasks = JSON.parse(data);

      // Find the task with a matching id
      const taskToUpdate = tasks.find((task) => task.id == id);

      if (!taskToUpdate) {
        return res.status(404).send({ error: "Task not found" });
      }

      // Update the properties of the matching task
      taskToUpdate.endDate = endDate;
      taskToUpdate.endTime = endTime;
      taskToUpdate.active = false;
      taskToUpdate.duration = duration;

      // Write the updated array of tasks back to the tasks.json file
      fs.writeFile(
        tasksFilePath,
        JSON.stringify(tasks, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .send({ error: "Failed to update tasks data" });
          }

          res.send({ update: true, message: "Task updated successfully" });
        }
      );
    } catch (parseError) {
      console.log(parseError);
      return res.status(500).send({ error: "Failed to parse tasks data" });
    }
  });
});

router.put("/edit/:id", function (req, res, next) {
  const { id } = req.params;
  const { name, active, startDate, startTime, endDate, endTime, duration } =
    req.body;

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
      const taskIndex = tasks.findIndex((task) => task.id == id);

      if (taskIndex === -1) {
        return res.status(404).send({ error: "Task not found" });
      }

      // Update the task with the new values
      tasks[taskIndex].name = name;
      tasks[taskIndex].active = active;
      tasks[taskIndex].startDate = startDate;
      tasks[taskIndex].startTime = startTime;
      tasks[taskIndex].endDate = endDate;
      tasks[taskIndex].endTime = endTime;
      tasks[taskIndex].duration = duration;

      // Write the updated list of tasks back to the tasks.json file
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

          // Send a success response indicating that the task was updated
          res.status(200).send({ success: true });
        }
      );
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).send({ error: "Failed to parse tasks data" });
    }
  });
});

router.post("/newtask", function (req, res, next) {
  const { name, startDate, startTime } = req.body;

  // Read the current tasks from the tasks.json file
  fs.readFile(tasksFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Failed to read tasks data" });
    }

    try {
      // Parse the JSON data into an array of tasks
      const tasks = JSON.parse(data);

      // Find the largest ID and increment it by 1
      let maxId = 0;
      for (const task of tasks) {
        if (task.id > maxId) {
          maxId = task.id;
        }
      }
      const newId = maxId + 1;

      // Create a new task object with the provided data and new ID
      const newTask = {
        id: newId,
        name: name,
        startDate: startDate,
        startTime: startTime,
        active: true,
        endDate: "",
        endTime: "",
        duration: "",
      };

      // Add the new task to the list of tasks
      tasks.push(newTask);

      // Write the updated list of tasks back to the tasks.json file
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

          res.send({ added: true });
        }
      );
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).send({ error: "Failed to parse tasks data" });
    }
  });
});

router.delete("/delete/:id", (req, res, next) => {
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

      // Find the index of the task with the specified ID
      const taskIndex = tasks.findIndex((task) => task.id == id);

      if (taskIndex === -1) {
        return res.status(404).send({ error: "Task not found" });
      }

      // Remove the task from the list
      const deletedTask = tasks.splice(taskIndex, 1)[0];

      // Write the updated list of tasks back to the tasks.json file
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

          // Send a response indicating the successful deletion
          res.send({ success: true });
        }
      );
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).send({ error: "Failed to parse tasks data" });
    }
  });
});

module.exports = router;
