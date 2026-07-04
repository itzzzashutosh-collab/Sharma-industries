'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function createPurchaseBill(formData: any, itemsArray: any[]) {
  try {
    const { data: result, error } = await supabaseAdmin.rpc('create_purchase_bill_rpc', {
      p_master_data: formData,
      p_items_array: itemsArray
    });

    if (error) throw error;
    return { success: true, data: result, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}
