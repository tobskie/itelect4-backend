import type { SessionDoc, TutorDoc } from "../types/index";

// The tutors and sessions db.json has held since Session 7, word for
// word. They are reference data: nobody creates them through the API, so
// they live here and go into the database once, from src/seed.ts.
//
// itelect4-project deleted its mock arrays in Session 7 when json-server
// took over, and deletes db.json in Session 10. This is that same list,
// on the side of the wire that now owns it.

export const TUTORS: TutorDoc[] = [
  {
    _id: "1",
    name: "Toby Olimpo",
    email: "tobster@example.com",
    role: "tutor",
    isActive: true,
    bio: "4th yr BSIT Student. magaling sya, oo hehehe.",
    subjects: ["ITELECT4", "Data Structures", "Next.js"],
  },
  {
    _id: "2",
    name: "Rio Amor",
    email: "rioamor@example.com",
    role: "tutor",
    isActive: false,
    bio: "3rd yr BSIT Student. magaling din sya",
    subjects: ["ITELECT4", "Data Structures", "Next.js"],
  },
  {
    _id: "3",
    name: "Mau B",
    email: "maub@example.com",
    role: "tutor",
    isActive: true,
    bio: "Psych Student. Psychology tutor since 1st year.",
    subjects: ["Psychology"],
  },
];

export const SESSIONS: SessionDoc[] = [
  {
    _id: "101",
    tutorId: "1",
    subject: "ITELECT4",
    description: "Vite + React + TS Component Scaffolding Lab",
    scheduledAt: new Date("2026-07-20T14:00:00.000Z"),
    durationMinutes: 60,
    maxSlots: 3,
  },
  {
    _id: "102",
    tutorId: "3",
    subject: "Calculus",
    description: "Integration Techniques & Practical Review",
    scheduledAt: new Date("2026-07-22T09:30:00.000Z"),
    durationMinutes: 90,
    maxSlots: 5,
  },
  {
    _id: "103",
    tutorId: "2",
    subject: "Data Structures",
    description: "Linked Lists, Stacks and Queues walkthrough",
    scheduledAt: new Date("2026-07-25T13:00:00.000Z"),
    durationMinutes: 60,
    maxSlots: 4,
  },
];
