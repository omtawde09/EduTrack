# Student Attendance System

A modern, web-based application for teachers to easily manage student attendance. This application allows teachers to create classrooms, add students, and take attendance for different dates and times. It also provides a history of all attendance records, which can be exported as a CSV file.

## Features ✨

* **User Authentication**: Secure login for teachers to manage their own classrooms and student data.
* **Classroom Management**: Teachers can create, view, and delete classrooms, each with a name, subject, and description.
* **Student Management**: For each classroom, teachers can add students manually or import them from an Excel/CSV file. They can also view and delete students from a classroom.
* **Attendance Tracking**: A simple and intuitive interface to mark students as "present" or "absent" for a specific date and time.
* **Attendance History**: View a detailed history of all past attendance records, grouped by session.
* **Data Export**: Export attendance records to a CSV file for a specific classroom or for all classrooms.
* **Responsive Design**: A clean and modern user interface that works on different screen sizes.

## Tech Stack 💻

* **Frontend**: React.js
* **Styling**: Tailwind CSS (based on the class names like `flex`, `items-center`, `justify-between`, `p-4`, etc.)
* **Icons**: Lucide React

## File Structure and Formats 📁

Here is the file structure of the project and the correct format for each file:

* `components/attendence/student_row.jsx`: React component for a single student row in the attendance list.
* `entities/attendence.json`: JSON definition for the attendance data structure.
* `entities/classroom.json`: JSON definition for the classroom data structure.
* `entities/student.json`: JSON definition for the student data structure.
* `layout.jsx`: Main layout component with the navigation bar.
* `pages/DateSelection.jsx`: Page for selecting the date and time for attendance.
* `pages/add_classroom.jsx`: Page for adding a new classroom.
* `pages/attendence_history.jsx`: Page for viewing attendance history.
* `pages/dashboard.jsx`: The main dashboard page.
* `pages/manage_students.jsx`: Page for managing students in a classroom.
* `pages/student_list.jsx`: Page for taking attendance for a specific class.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm (or yarn) installed on your machine.

### Installation

1.  Clone the repo
    ```sh
    git clone [https://github.com/your_username/edutrack.git](https://github.com/your_username/edutrack.git)
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Start the development server
    ```sh
    npm start
    ```

## Usage

1.  **Login**: Start by logging into the application.
2.  **Create a Classroom**: From the dashboard, create a new classroom by providing a name and subject.
3.  **Add Students**: Add students to your classroom, either one by one or by uploading a CSV/Excel file.
4.  **Take Attendance**: Select a classroom from the dashboard, choose a date and time, and then mark each student as present or absent.
5.  **View History**: You can view the attendance history for any of your classes on the "History" page and export it if needed.
