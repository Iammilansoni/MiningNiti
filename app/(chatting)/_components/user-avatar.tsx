"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeModeToggle } from "./themeModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Badge } from "./ui/badge";

interface Props {
  userId: string
}

export const UserAvatar: React.FC<Props> = ({ userId }) => {
  const router = useRouter();
  // const [user, setUser] = React.useState<user>();
  const [profileImage, setProfileImage] = React.useState('https://github.com/shadcn.png')

  const goToEnrolledCourses = () => {
    router.push(`/${userId}/enrolledCourses`);
  }

  // useEffect(() => {
  //   fetch(`https://localhost:3000/api/profile/${userId}`)
  //     .then(
  //       (response) => {
  //         console.log(response.json().toString());
  //         // setUser(response.json());
  //         // setProfileImage(user.profileImage);
  //       })
  //     .catch((error: any) => {
  //       console.log("Error", error.message);
  //     })
  // });

  /**
   *  <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="mx-2 lg:mx-3">
            <AvatarImage src={profileImage} alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem
            onClick={goToEnrolledCourses}
          >Enrolled Courses</DropdownMenuItem>
          <DropdownMenuItem>Cart</DropdownMenuItem>
          <DropdownMenuItem>Notification</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-center items-center">
            <Badge className="mx-auto items-center" variant="destructive">Logout</Badge>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
   */

  return (
    <div className="flex items-center py-auto">
      <ThemeModeToggle />

      <Link href={`/profile/${userId}/`}>
        <Avatar className="mx-2 lg:mx-3">
          <AvatarImage src={profileImage} alt="username" />
          <AvatarFallback>{'A'}</AvatarFallback>
        </Avatar>
        {/* <div className="mx-1 p-1 rounded-full bg-gray-900 lg:mx-3">
          <UserButton afterSignOutUrl="/" />
        </div> */}        
      </Link>
    </div>
  );
}

export default UserAvatar;
