import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StudentCourseCardProps {
  course: {
    id: string;
    name: string;
    description: string | null;
    enrolledAt: Date;
    teacher: {
      name: string | null;
      email: string;
    };
    _count: {
      lessons: number;
      enrollments: number;
    };
  };
}

export function StudentCourseCard({ course }: StudentCourseCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-1">{course.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description || 'No description available'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        {/* Teacher Info */}
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-gray-600">
            {course.teacher.name || course.teacher.email}
          </span>
        </div>

        {/* Lesson Count */}
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-gray-600">
            {course._count.lessons} {course._count.lessons === 1 ? 'lesson' : 'lessons'}
          </span>
        </div>

        {/* Classmates */}
        <div className="flex items-center gap-2 text-sm">
          {/* <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg> */}
          {/* <span className="text-gray-600">
            {course._count.enrollments} {course._count.enrollments === 1 ? 'student' : 'students'}
          </span> */}
        </div>

        {/* Enrolled Date */}
        {/* <div className="pt-2 text-xs text-gray-500">
          Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
        </div> */}
      </CardContent>

      <CardFooter>
        <Link href={`/student/courses/${course.id}/lessons`} className="w-full">
          <Button className="w-full" variant="default">
            View Lessons
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
