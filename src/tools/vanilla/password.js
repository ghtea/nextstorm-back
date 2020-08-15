
export const generatePassword = (length) => {
  
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  let result = "";
  
  for (var i = 0, n = charset.length; i < length; ++i) {
      result += charset.charAt(Math.floor(Math.random() * n));
  }
  
  return result;
}