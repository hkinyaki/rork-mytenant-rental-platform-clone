import { User } from "@/types";

export const MOCK_CURRENT_USER: User = {
  id: "user-1",
  name: "Alex Maina",
  email: "alex.maina@example.com",
  phone: "+254712345678",
  photo: "https://i.pravatar.cc/150?img=33",
  role: "both",
  rating: 4.5,
  reviewCount: 8,
  joinedDate: "2023-06-15",
};

export const MOCK_HOST_USER: User = {
  id: "host-1",
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "+254723456789",
  photo: "https://i.pravatar.cc/150?img=1",
  role: "host",
  kycStatus: "verified",
  tinNumber: "A123456789Z",
  rating: 4.8,
  reviewCount: 127,
  joinedDate: "2022-03-20",
};
