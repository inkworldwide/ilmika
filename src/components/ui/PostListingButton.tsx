"use client";

import { useRouter } from "next/navigation";

interface PostListingButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function PostListingButton({ className, children }: PostListingButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Check if auth_token cookie exists
    const hasToken = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("auth_token="));

    if (hasToken) {
      router.push("/properties/add");
    } else {
      router.push("/auth/login?redirect=/properties/add");
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
