"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function addFleetVehicle(payload: {
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  capacity: string;
}) {
  try {
    const id = `VEH-${Date.now().toString().slice(-4)}`;
    const { error } = await supabaseAdmin
      .from("fleet_vehicles")
      .insert({
        id,
        plate_number: payload.plateNumber,
        driver_name: payload.driverName,
        driver_phone: payload.driverPhone,
        vehicle_type: payload.vehicleType,
        capacity: payload.capacity,
        status: "Idle",
        current_route: "Unassigned"
      });

    if (error) throw error;

    revalidatePath("/dashboard/ceo/market-intelligence");
    return { success: true };
  } catch (err: any) {
    console.error("Error adding fleet vehicle:", err);
    return { success: false, error: err.message };
  }
}

export async function addDeliveryDispatch(payload: {
  dealerName: string;
  location: string;
  items: string;
  value: number;
  vehiclePlate: string;
}) {
  try {
    const id = `DISP-${Date.now().toString().slice(-4)}`;
    const { error } = await supabaseAdmin
      .from("delivery_dispatches")
      .insert({
        id,
        dealer_name: payload.dealerName,
        location: payload.location,
        items: payload.items,
        value: payload.value,
        vehicle_plate: payload.vehiclePlate,
        status: "Pending"
      });

    if (error) throw error;

    revalidatePath("/dashboard/ceo/market-intelligence");
    return { success: true };
  } catch (err: any) {
    console.error("Error adding delivery dispatch:", err);
    return { success: false, error: err.message };
  }
}

export async function addDeliveryRoute(payload: {
  routeName: string;
  stopsCount: number;
  mappedDealers: string[];
  assignedVehicle: string;
}) {
  try {
    const id = `R-${Date.now().toString().slice(-4)}`;
    const { error } = await supabaseAdmin
      .from("delivery_routes")
      .insert({
        id,
        route_name: payload.routeName,
        stops_count: payload.stopsCount,
        mapped_dealers: payload.mappedDealers,
        assigned_vehicle: payload.assignedVehicle,
        progress: 0
      });

    if (error) throw error;

    revalidatePath("/dashboard/ceo/market-intelligence");
    return { success: true };
  } catch (err: any) {
    console.error("Error adding delivery route:", err);
    return { success: false, error: err.message };
  }
}
