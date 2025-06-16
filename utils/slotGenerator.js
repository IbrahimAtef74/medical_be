function generateSlots(startTime, endTime, sessionDuration) {
    const slots = [];
    
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    while (currentMinutes + sessionDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      
      slots.push(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      );
      
      currentMinutes += sessionDuration;
    }
    
    return slots;
  }
  
  module.exports = { generateSlots };