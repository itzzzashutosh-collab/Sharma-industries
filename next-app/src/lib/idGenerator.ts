export async function generateSemanticId(
  supabase: any,
  table: string,
  prefix: string,
  name: string,
  location: string | null = null
): Promise<string> {
  // e.g., Prefix_Name/Location_SequentialNumber (e.g., SP_Raman_323001_001)
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);
  const cleanName = sanitize(name) || "Unknown";
  
  let idPrefix = `${prefix}_${cleanName}`;
  if (location) {
    const cleanLocation = sanitize(location);
    if (cleanLocation) {
      idPrefix += `_${cleanLocation}`;
    }
  }

  // Get the latest ID starting with this prefix to determine sequential number
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .like("id", `${idPrefix}_%`)
    .order("id", { ascending: false })
    .limit(1);

  let seqNum = 1;
  if (data && data.length > 0) {
    const lastId = data[0].id;
    const parts = lastId.split("_");
    const lastNumStr = parts[parts.length - 1];
    const lastNum = parseInt(lastNumStr, 10);
    if (!isNaN(lastNum)) {
      seqNum = lastNum + 1;
    }
  }

  const paddedSeq = seqNum.toString().padStart(3, "0");
  return `${idPrefix}_${paddedSeq}`;
}
