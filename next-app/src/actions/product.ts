'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function createProduct(data: any) {
  try {
    const { data: result, error } = await supabaseAdmin
      .from('products')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const { data: result, error } = await supabaseAdmin
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}

export async function getProducts() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('sku_number', { ascending: true });

    if (error) throw error;
    return { success: true, data, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}
