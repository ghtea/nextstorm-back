export const getTimeStamp = () => {
  const timeNumber = new Date().getTime();
  const timeStr = timeNumber.toString();
  
  return timeStr;
}