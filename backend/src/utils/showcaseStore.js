const crypto = require('crypto');

// Centralized In-Memory Real-Time State Store (Starts empty by default to reflect clean DB state)
const events = [];
const registrations = [];

const addRegistration = (reg) => {
  registrations.unshift(reg);
};

const getRegistrationsForUser = (userId) => {
  return registrations.filter((r) => r.user_id === userId || !userId);
};

const addEvent = (evt) => {
  events.unshift(evt);
};

const getEvents = () => events;

const updateEventStatus = (id, status) => {
  const evt = events.find((e) => e.id === id);
  if (evt) evt.status = status;
  return evt;
};

module.exports = {
  events,
  registrations,
  addRegistration,
  getRegistrationsForUser,
  addEvent,
  getEvents,
  updateEventStatus,
};
