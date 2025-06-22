import { NextResponse, NextRequest } from "next/server";

// Mock data for courses
const mockCourses = [
  {
    id: "1",
    userId: "1",
    courseName: "Introduction to Machine Learning",
    domain: "AI & Machine Learning",
    numberOfDays: 7,
    Introduction: "This course covers the fundamentals of machine learning, from basic algorithms to practical applications.",
    structure: JSON.stringify({
      name: "Introduction to Machine Learning",
      domain: "AI & Machine Learning",
      numberofdays: 7,
      Introduction: ["This course covers the fundamentals of machine learning, from basic algorithms to practical applications."],
      modules: [
        { day: 1, title: "Fundamentals of ML" },
        { day: 2, title: "Supervised Learning" },
        { day: 3, title: "Unsupervised Learning" },
        { day: 4, title: "Neural Networks" },
        { day: 5, title: "Deep Learning" },
        { day: 6, title: "Reinforcement Learning" },
        { day: 7, title: "Applied ML Projects" }
      ]
    }),
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2023-11-15"),
    Archive: 0
  },
  {
    id: "2",
    userId: "1",
    courseName: "Web Development with React",
    domain: "Web Development",
    numberOfDays: 5,
    Introduction: "Master modern web development using React and related technologies.",
    structure: JSON.stringify({
      name: "Web Development with React",
      domain: "Web Development",
      numberofdays: 5,
      Introduction: ["Master modern web development using React and related technologies."],
      modules: [
        { day: 1, title: "React Fundamentals" },
        { day: 2, title: "State Management" },
        { day: 3, title: "React Router" },
        { day: 4, title: "API Integration" },
        { day: 5, title: "Deployment" }
      ]
    }),
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2023-12-01"),
    Archive: 0
  },
  {
    id: "3",
    userId: "1",
    courseName: "Data Science Fundamentals",
    domain: "Data Science",
    numberOfDays: 6,
    Introduction: "Learn the core concepts and tools used in data science.",
    structure: JSON.stringify({
      name: "Data Science Fundamentals",
      domain: "Data Science",
      numberofdays: 6,
      Introduction: ["Learn the core concepts and tools used in data science."],
      modules: [
        { day: 1, title: "Introduction to Data Science" },
        { day: 2, title: "Data Cleaning and Preparation" },
        { day: 3, title: "Exploratory Data Analysis" },
        { day: 4, title: "Statistical Analysis" },
        { day: 5, title: "Data Visualization" },
        { day: 6, title: "Machine Learning for Data Science" }
      ]
    }),
    createdAt: new Date("2023-10-20"),
    updatedAt: new Date("2023-10-20"),
    Archive: 1
  }
];

export async function GET(req: NextRequest, { params }: { params: { slug: string, archive: string } }) {
    const UserId = params.slug;
    const archive = params.archive;
    
    console.log(`Fetching courses for user ${UserId} with archive status ${archive}`);
    
    // Filter courses based on userId and archive status
    const courses = mockCourses.filter(course => 
        course.userId === UserId && 
        course.Archive === parseInt(archive)
    );
    
    console.log(`Found ${courses.length} courses`);
    
    return new NextResponse(JSON.stringify(courses), {
        status: 200,
    });
}
