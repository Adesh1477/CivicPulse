export const DEPARTMENT_MAP = {
  Pothole: "Road Maintenance Department",
  Garbage: "Sanitation Department",
  Streetlight: "Electrical Department",
  Other: "General Civic Operations"
};

export const RESOLUTION_TIME_MAP = {
  Pothole: "2–3 Days",
  Garbage: "1–2 Days",
  Streetlight: "3–5 Days",
  Other: "2–4 Days"
};

export const aiService = {
  recommendDepartment(selectedType = "Pothole") {
    const mapped = DEPARTMENT_MAP[selectedType] || DEPARTMENT_MAP.Other;
    return {
      department: mapped,
      recommendation: `${selectedType} issue should be assigned to ${mapped}.`
    };
  }
};
