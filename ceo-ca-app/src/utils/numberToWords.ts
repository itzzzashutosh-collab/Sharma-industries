export function numberToWords(num: number): string {
  if (num === 0) return "Zero";

  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (n: number): string => {
    let str = "";
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " ";
      if (n % 10 > 0) {
        str += a[n % 10];
      }
    } else {
      str += a[n];
    }
    return str;
  };

  let numStr = Math.floor(num).toString();
  if (numStr.length > 9) return "Overflow";

  const n = ("000000000" + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";

  let str = "";
  str += n[1] != "00" ? inWords(parseInt(n[1])) + "Crore " : "";
  str += n[2] != "00" ? inWords(parseInt(n[2])) + "Lakh " : "";
  str += n[3] != "00" ? inWords(parseInt(n[3])) + "Thousand " : "";
  str += n[4] != "0" ? inWords(parseInt(n[4])) + "Hundred " : "";
  str += n[5] != "00" ? ((str != "") ? "and " : "") + inWords(parseInt(n[5])) : "";

  return str.trim() + " Only";
}
