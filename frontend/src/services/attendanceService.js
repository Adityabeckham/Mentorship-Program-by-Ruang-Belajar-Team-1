import apiService from './api';

const attendanceService = {
  markAttendance: async (registrationId, isPresent) => {
    const response = await apiService.patch(`/attendance/${registrationId}`, { is_present: isPresent });
    return response.data;
  },
};

export default attendanceService;
