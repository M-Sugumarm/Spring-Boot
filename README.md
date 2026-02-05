<img width="1920" height="1300" alt="screencapture-localhost-8080-2025-12-18-14_14_33" src="https://github.com/user-attachments/assets/49a4b29a-a1cf-4367-b81b-fa8a88b52aa3" />

# MegTodo - Spring Boot Maven Project

A modern, attractive Todo application built with Spring Boot and Thymeleaf.

## Features

- ✔ Add, update, delete tasks
- ✔ Filter by status (All, Active, Done)
- ✔ Filter by priority (High, Medium, Low)
- ✔ Real-time search
- ✔ Light/Dark mode toggle
- ✔ Responsive design
- ✔ Smooth animations
- ✔ **Cloud persistence with Firebase Firestore**

## Technology Stack

- **Backend**: Spring Boot 3.1.4
- **Templates**: Thymeleaf
- **Frontend**: HTML, CSS, JavaScript (ES6 Modules)
- **Database**: Firebase Firestore (Cloud NoSQL)
- **Analytics**: Firebase Analytics

## Prerequisites

- Java 17 or higher
- Maven 3.6+

## How to Run

1. Clone or download this project
2. Navigate to the project directory
3. Run the application:

```bash
mvn spring-boot:run
```

Or build and run the JAR:

```bash
mvn clean package
java -jar target/megtodo-0.0.1-SNAPSHOT.jar
```

4. Open your browser and go to: http://localhost:8080

## Project Structure

```
MegTodo/
├── pom.xml
├── src/main/
│   ├── java/com/meg/todo/
│   │   ├── MegTodoApplication.java
│   │   ├── controller/
│   │   │   ├── ViewController.java
│   │   │   └── TodoApiController.java
│   │   ├── entity/
│   │   │   └── Todo.java
│   │   └── service/
│   │       └── TodoService.java
│   └── resources/
│       ├── static/
│       │   ├── css/app.css
│       │   └── js/
│       │       ├── AddTask.js
│       │       └── TodoList.js
│       ├── templates/
│       │   ├── fragments/
│       │   │   ├── header.html
│       │   │   └── footer.html
│       │   ├── index.html
│       │   ├── about.html
│       │   └── contact.html
│       └── application.properties
└── README.md
```

<img width="1920" height="1300" alt="screencapture-localhost-8080-2025-12-18-14_16_28" src="https://github.com/user-attachments/assets/1dad6070-17ec-4577-b1cf-00ab3964011c" />

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | List all todos |
| GET | `/api/todos?q=search` | Search todos |
| POST | `/api/todos` | Create a new todo |
| POST | `/api/todos/{id}/toggle` | Toggle todo completion |
| DELETE | `/api/todos/{id}` | Delete a todo |

## Future Enhancements

- Persist todos using Spring Data JPA and H2/PostgreSQL
- Add user authentication
- Add drag-and-drop ordering
- Add due dates and reminders

---

Built with ❤️ by Meg's Pro Todo Team
