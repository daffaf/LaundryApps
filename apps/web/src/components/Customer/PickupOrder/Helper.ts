import { startOfDay, addDays, isBefore, isAfter, parse, isToday } from 'date-fns';
import { jadwalPickup } from './Utils';

const today = startOfDay(new Date());
const maxDate = addDays(today, 7);

// Function to determine if a time slot is in the past
const isValidTimeSlot = (jadwal: string): boolean => {
  const [startTime] = jadwal.split(' - '); // Extract the start time
  const parsedTime = parse(startTime, 'hh.mm a', new Date());
  console.log(parsedTime)
  return isAfter(parsedTime, new Date()); // Compare the time with the current time
};

// Filter time slots based on the selected date
export const getFilteredTimeslots = (selectedDate: Date | null) => {
  if (!selectedDate) return;

  // For today, filter timeslots based on the current time
  if (isToday(selectedDate)) {
    // return jadwalPickup.filter(isValidTimeSlot);
  }
  // Return all timeslots for future dates
  return jadwalPickup;
};

// Function to check if a date is selectable
const isDateSelectable = (date: Date) => {
  return !isBefore(date, today) && !isAfter(date, maxDate);
};
