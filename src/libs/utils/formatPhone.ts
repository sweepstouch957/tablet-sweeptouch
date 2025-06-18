export const validatePhone = (phone: string) =>
  /^\(\d{3}\) \d{3}-\d{4}$/.test(phone);

export const formatPhone = (input: string) => {
  const digits = input.replace(/\D/g, "").substring(0, 10);
  const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return input;

  return [
    match[1] ? `(${match[1]}` : "",
    match[2] ? `) ${match[2]}` : "",
    match[3] ? `-${match[3]}` : "",
  ]
    .join("")
    .trim();
};