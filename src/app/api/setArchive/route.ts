import { NextResponse, NextRequest } from "next/server";

// Mock courses data (reference - this would be imported from a shared location in a real app)
const mockCourses = [
  {
    id: "1",
    userId: "1",
    courseName: "Introduction to Machine Learning",
    Archive: 0
  },
  {
    id: "2",
    userId: "1",
    courseName: "Web Development with React",
    Archive: 0
  },
  {
    id: "3",
    userId: "1",
    courseName: "Data Science Fundamentals",
    Archive: 1
  }
];

export async function POST(req: NextRequest) {
    const data = await req.json();
    console.log("Archive request:", data);
    
    try {
        // Find course by ID
        const courseIndex = mockCourses.findIndex(course => course.id === data.courseId);
        
        if (courseIndex === -1) {
            console.log("Course not found:", data.courseId);
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }
        
        // Update archive status
        mockCourses[courseIndex].Archive = parseInt(data.archive, 10);
        console.log(`Updated course ${data.courseId} archive status to ${data.archive}`);
        
        return NextResponse.json({ message: 'success' });
    } catch (err) {
        console.error("Error updating archive status:", err);
        return NextResponse.json({ message: "Error updating archive status", error: String(err) });
    }
}



