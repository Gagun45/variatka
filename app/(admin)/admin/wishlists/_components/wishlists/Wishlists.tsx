"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useAdminWishlists } from "@/features/recipe/hooks/useAdminWishlists";
import React from "react";
import AdminWishlistsList from "./list/AdminWishlistsList";

const Wishlists = () => {
  const { data: users, isLoading, isError } = useAdminWishlists();
  if (isLoading) return <Loader />;
  if (isError || !users) return <StateScreen />;
  if (users.length === 0) return <StateScreen title="No wishlists yet" />;
  return <AdminWishlistsList users={users} />;
};

export default Wishlists;
